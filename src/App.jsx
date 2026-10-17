import React,{useEffect,useMemo,useState} from"react";
import{
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Bookmark,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Compass,
    Download,
    Globe2,
    Heart,
    Hotel,
    MapPin,
    Menu,
    Minus,
    Plus,
    RotateCcw,
    Search,
    Share2,
    Sparkles,
    Sun,
    Users,
    Wallet,
    X
} from "lucide-react";
import{
    activities,
    destinations,
    generateItinerary,
    interests
}from "./data.js";
const STORAGE_KEY="painless-trips-v1";
const initialPreferences={
    destinationId:"lisbon",
    days:5,
    budget:900,
    travelers:2,
    pace:"balenced",
    interests:["culture","food","nature"],
    accomodation:"confortable",
    foodPreferences:"local",
    currency:"EUR"
};
function readTrips(){
    try{
        const stored=localStorage.getItem(STORAGE_KEY);
        return stored? JSON.parse(stored):[];
    }catch{
        return[];
    }
}
function money(value,currency="EUR"){
    return new Intl.NumberFormat("en-GB",{
        style:"currency",
        currency,
        maximumFractionDigits:0
    }).format(value);
}
function durationLabel(minutes){
    const hours=Math.floor(minutes/60);
    const remainer=minutes%60;
    if(!hours)return `${remainer}min`;
    if(!remainer)return `${hours}h`;
    return`${hours}h ${remainer}m`;
}
function App(){
    const [page,setPage]=useState("home");
    const [preferences,setPreferences]=useState(initialPreferences);
    const [trips,setTrips]=useState(()=>readTrips());
    const [activeTripId,setActiveTripId]=useState(null);
    const [activeDay,setActiveDay]=useState(0);
    const [completed,setCompleted]=useState({});
    const [favorites,setFavorites]=useState([]);
    const [search,setSearch]=useState("");
    const [notice,setNotice]=useState("");
    const [mobileMenu,setMobileMenu]=useState(false);
    const [showAllDestinations,setShowAllDestinations]=useState(false);
    const currentTrip=trips.find((trip)=>trip.id===activeTripId)??null;
    useEffect(()=>{
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
        }catch{
            setNotice("Storage is full export your trips before saving more.");
        }
    },[trips]);
    useEffect(()=>{
        if(!notice)return;
        const timeout=window.setTimeout(()=>setNotice(""),3000);
        return () =>window.clearTimeout(timeout);
    },[notice]);
    const filterDestinations=useMemo(()=>{
        const query=search.trim().toLowerCase();
        return destinations.filter((destination)=>
            `${destination.name} ${destination.country} ${destination.tags.join(" ")}`
        .toLowerCase()
        .includes(query)
        );
    },[search]);
    function updatePreferences(key,value){
        setPreferences((old)=>({ ...old,[key]:value}));
    }
    function toggleInterest(id){
        setPreferences((old)=>{
            const exists=old.interests.includes(id);
            return{
                ...old,
                interests:exists 
                    ?old.interests.filter((item)=>item!==id)
                    :[...old.interests,id]
            };
        });
    }
    function openPlanner(destinationId=preferences.destinationId){
        setPreferences((old)=>({...old,destinationId}));
        setPage("planner");
        setMobileMenu(false);
        window.scrollTo({top:0,behavior:"smooth"});
    }
    function buildTrip(){
        const itinerary = generateItinerary(preferences);
        const trip={
            id:crypto.randomUUID 
                ? crypto.randomUUID()
                :`${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createat:new Date().toISOString(),
            title:`${itinerary.destination.name}escape`,
            preferences:{...preferences},
            itinerary
        };
        setTrips((old)=>[trip,...old]);
        setActiveTripId(trip.id);
        setActiveDay(0);
        setPage("itinerary");
        setNotice("Your itinerary is ready!");
        window.scrollTo({top:0,behavior:"smooth"});
    }
    function openTrip(trip){
        setPreferences(trip.preferences);
        setActiveTripId(trip.id);
        setActiveDay(0);
        setPage("itinerary");
        window.scrollTo({top:0,behavior:"smooth"});
    }
    function deleteTrip(id){
        setTrips((old)=>old.filter((trip)=>trip.id!==id));
        if(activeTripId===id){
            setActiveTripId(null);
            setPage("trips");
        }
        setNotice("Trip removed.");
    }
    function toggleComplete(tripId,dayNumber,activityId){
        const key=`${tripId}-${dayNumber}-${activityId}`;
        setCompleted((old)=>({...old,[key]:!old[key]}));
    }
    function isComplete(tripid,dayNumber,activityId){
        return Boolean(completed[`${tripId}-${dayNumber}-${activityId}`]);
    }
    function toggleFavorite(id){
        setFavorites((old)=>
        old.includes(id)?old.filter((item)=>item!==id):[...old,id]
    );
    }
    function exportTrip(trip=currentTrip){
        if(!trip) return;
        const lines=[
            `PAINLESS -${trip.title}`,
            `Destination:${trip.itinerary.destination.name},${trip.itinerary.destination.country}`,
            `Days:${trip.preferences.days}`,
            `Travelers:${trip.preferences.travelers}`,
            `budget:${money(trip.preferences.budget,trip.preferences.currency)}`,
            `Estimated total:${money(trip.itinerary.estimatedTotal, trip.preferences.currency)}`,
            "",
            "ESTIMATED ITINERARY",
            ""
        ];
        trip.itinerary.days.forEach((day)=>{
            lines.push(`DAY${day.day}-${day.title}`);
            day.activities.forEach((activity)=>{
                lines.push(
                    `${activity.time} | ${activity.title} | ${durationLabel(activity.duration)} | ${money(activity.cost,trip.preferences.currency)} per person`
                );
            });
            lines.push(
                `Estimated daily total for the  group:${money(day.estimatedCostForGroup,trip.preferences.currency)}`,
                ""
            );
        });
        lines.push(
            "Note: Prices ate illustratives estimates,not live offers.",
            "Generated with Painless."
        );
        const blob =new Blob([lines.join("\n")],{
            type:"text/plain;charset=utf-8"
        });
        const url= URL.createObjectURL(blob);
        const link=document.createElement("a");
        link.href=url;
        link.download="painless-itinerary.txt";
        link.click();
        URL.revokeObjectURL(url);
        setNotice("Your itinerary has been exported.");
    }
    async function shareTrip(trip=currentTrip){
        if(!trip) return;
        const text=[
            `${trip.title}- planned with Painless`,
            `${trip.preferences.days} days in ${trip.itinerary.destination.name}`,
            `Estimated total: ${money(trip.itinerary.estimatedTotal, trip.preferences.currency)}`,
            "Prices are illustrative estimates."
        ].join("\n");
        try{
            if(navigator.share){
                await navigator.share({title:trip.title,text});
            }else if (navigator.clipboard){
                await navigator.clipboard.writeText(text);
                setNotice("Trip summary copied.");
            }else{
                setNotice("Use Export to save itinerary.");
            }
        }catch (error){
            if(error.name !== "AboutError"){
                setNotice("Sharing was not available. Try Export instead.");
            }
        }
    }
    const featuredDestinations=showAllDestinations
        ? filterDestinations
        : filterDestinations.slice(0,4);
    const selectedDestination=
        destinations.find((item)=>item.id===preferences.destinationId)??
        destinations[0];
    const pageTitle={
        home:"Your next chapter starts here.",
        planner:"Your trip, your way.",
        itinerary:currentTrip?.title??"Your itineray",
        trips:"All your adventures",
        saved:"Places worth remembering."
    }[page];
    return(
        <div className="app-shell">
            <header className="topbar">
                <button
                    className="brand"
                    onClick={()=> setPage("home")}
                    aria-label="Painless home"
                >
                    <span className="brand-mark"><Compass size={21}/></span>
                    <span>painless<span className="brand-dot">.</span></span>
                </button>
                <button
                    className="mobile-menu-toggle icon-button"
                    onClick={()=>setMobileMenu((old)=>!old)}
                    aria-label="Toggle navigation"
                >
                    {mobileMenu ? <X/>: <Menu/>}
                </button>
                <nav className={`main-nav${mobileMenu ? "nav-open":""}`}>
                    <button
                        className={page==="home"?"nav-link active": "nav-link"}
                        onClick={()=> {setPage("home"); setMobileMenu(false);}}
                    >
                        Discover
                    </button>
                    <button
                        className={page==="planner" ? "nav-link active": "nav-link"}
                        onClick={()=>openPlanner()}
                    >
                        Plan a trip
                    </button>
                    <button 
                        className={page==="trips"?"nav-link active": "nav-link"}
                        onClick={()=> {setPage("trips"),setMobileMenu(false);}}
                    >
                        My trips
                        {trips.length>0 && <span className="nav-count">{trips.length}</span>}
                    </button>
                    <button
                        className={page==="saved"?"nav-link active":"nav-link"}
                        onClick={()=> {setPage("saved"); setMobileMenu(false);}}
                    >
                        Saved places
                    </button>
                </nav>
                <button className="topbar-cta" onClick={()=>openPlanner()}>
                    Start planning <ArrowUpRight size={16} />
                </button>
            </header>
            <main>
                {page==="home"&&(
                    <HomePage
                        destinations={featuredDestinations}
                        search={search}
                        setSearch={setSearch}
                        openPlanner={openPlanner}
                        toggleFavorites={toggleFavorite}
                        favorites={favorites}
                        showAll={showAllDestinations}
                        setShowAll={setShowAllDestinations}
                        onOpenSaved={()=>setPage("saved")}
                    />
                )}
                {page==="planner"&&(
                    <PlannerPage
                        preferences={preferences}
                        updatePreferences={updatePreferences}
                        toggleInterests={toggleInterest}
                        selectedDestination={selectedDestination}
                        onGerenate={buildTrip}
                        onBack={()=>setPage("home")}
                    />
                )}
                {page==="itinerary" && currentTrip&&(
                    <ItineraryPage
                        trip={currentTrip}
                        activeDay={activeDay}
                        setActiveDay={setActiveDay}
                        onBack={()=>setPage("trips")}
                        onEdit={()=>openPlanner(currentTrip.preferences.destinationId)}
                        onExport={()=>exportTrip(currentTrip)}
                        onShare={()=>shareTrip(currentTrip)}
                        isComplete={isComplete}
                        toggleComplete={toggleComplete}
                        onRegenerate={buildTrip}
                    />
                )}
                {page==="trips"&&(
                    <TripsPage
                        trips={trips}
                        onOpen={openTrip}
                        onDelete={deleteTrip}
                        onCreate={()=>openPlanner}
                    />
                )}
                {page==="saved"&&(
                    <SavedPage
                        favorites={favorites}
                        onToggle={toggleFavorite}
                        onPlan={openPlanner}
                    />
                )}
            </main>
            <footer className="footer">
                <button classNme="brand footer-brand" onClick={()=>setPage("home")}>
                    <span className="brand-mark"><Compass size={18}/></span>
                    <span>painless<span className="brand-dot">.</span></span>
                </button>
                <p>Less planning stress. More stories and adventures to tell.</p>
                <span className="footer-note">Made for curious travelers.</span>
            </footer>
            {notice &&(
                <div className="toast" role="status">
                    <Check size={17} /> {notice}
                    <button onClick={()=>setNotice("")} aria-label="Dismiss">
                        <X size={15}/>
                    </button>
                </div>
            )}
        </div>
    );
}
function HomePage({
    destinations,
    search,
    setSearch,
    openPlanner,
    toggleFavorite,
    favorites,
    showAll,
    setShowAll,
    onOpenSaved,
}){
    return(
        <>
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow"><Sparkles size={14}/>YOUR PERSONAL TRAVELCOMPANION</span>
                    <h1>Your next chapter <em>starts here.</em></h1>
                    <p>
                        Less time planning and more time discovering.
                        Build a thoughtful itinerary around your budget, your pace and the things you love doing.
                    </p>
                    <div className="hero-actions">
                        <button className="button button-primary" onClick={()=>openPlanner()}>
                            Plan my trip <ArrowRight size={17}/>
                        </button>
                        <button className="button button-quiet" onClick={onOpenSaved}>
                            <Heart size={17}/> Saved places
                        </button>
                    </div>
                    <div className="hero-trust">
                        <span><Check size={15}/>Your preferences</span>
                        <span><Check size={15}/>Budget-aware</span>
                        <span><Check size={15}/>Your own pace</span>
                    </div>
                </div>
                <div className="hero-visual">
                    <img
                        src="./images/coastel_travel.avif"
                        alt="Beautiful coastal travel destination"
                    />
                    <div className="floating-note note-top">
                        <span className="notice-icon"><Sun size={18}/></span>
                        <span><strong>Your kind of trip</strong><small>Thoughtfully planned</small></span>
                    </div>
                    <div className="floating-note note-bottom">

                    </div>
                </div>
            </section>
            <section className="value-strip">
                <div><span className="value-icon"><Wallet/></span><span><strong>Budget first</strong><small>Plan within your means</small></span></div>
                <div><span className="value-icon"><CalendarDays/></span><span><strong>Day by Day</strong><small>A clear plan for each day</small></span></div>
                <div><span className="value-icon"><Heart/></span><span><strong>Made fot you</strong><small>Your interests, your pace</small></span></div>
            </section>
            <section className="section destination-section" id="destinations">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">A LITTLE INSPIRATION</span>
                        <h2>Where will you<em>wander?</em></h2>
                        <p>Find somewhere new, or search for a place you already love.</p>
                    </div>
                    <div className="destination-search">
                        <Search size={17}/>
                        <input 
                            value={search}
                            onChange={(event)=>setSearch(event.target.value)}
                            placeholder="Search destinations..."
                            aria-label="Search destinations"
                        />
                    </div>
                </div>
                <div className="destination-grid">
                    {destinations.map((destination)=>(
                        <DestinationCard
                            key={destination.id}
                            destination={destination}
                            onselect={()=>openPlanner(destination.id)}
                            favorite={favorites.includes(destination.id)}
                            onFavorite={()=>toggleFavorite(destination.id)}
                        />
                    ))}
                </div>
                {destinations.length===0&&(
                    <div className="empty-state">
                        <Search size={28}/>
                        <h3>No destinations found</h3>
                        <p>Try a different city, country or keywork.</p>
                    </div>
                )}
                <div className="center-action">
                    <button 
                        className="button button-outline"
                        onClick={()=>setShowAll(!showAll)}
                    >
                        {showAll ? "Show fewer places":"Explore all sedtinations"}
                        {showAll ? <ArrowUpRight size={16}/>: <ArrowRight size={16}/>}
                    </button>
                </div>
            </section>
            <section className="planner-banner">
                <div className="banner-symbol"><Compass size={29}/></div>
                <div className="banner-copy">
                    <span className="eyebrow">YOUR NEXT ADVENTURE</span>
                    <h2>One destination.<em>A thousand possibilities.</em></h2>
                    <p>Tell me what matters to you. I'll help you make a plan.</p>
                </div>
                <button className="button button-light" onClick={()=>openPlanner()}>
                    Build my itinerary <ArrowRight size={17}/>
                </button>
            </section>
        </>
    );
}
function DestinationCard({
    destination,
    onSelect,
    favorite,
    onFavorite
}){
    return(
        <article className="destination-card">
            <button 
                className="destination-image"
                onClick={onSelect}
                aria-label={`Plan a trip to ${destination.name}`}
            >
                <img src={destination.image} alt={destination.name} loading="lazy"/>
                <span className="image-region">{destination.region}</span>
            </button>
            <button 
                className={`favorite-button ${favorite ? "favorited":""}`}
                onClick={onFavorite}
                aria-label={favorite ? "Remove saved destination":"Save destination"}
            >
                <Heart size={18} fill={favorite ? "currentcolor":"none"}/>
            </button>
            <button className="destination-info" onClick={onSelect}>
                <span className="destination-country">{destination.country}</span>
                <span className="destination-title">
                    {destination.name}<ArrowUpRight size={17}/>
                </span>
                <span className="destination-description">{destination.description}</span>
                <span className="destination-bottom">
                    <span>{destination.emoji} {destination.tags.slice(0,2).join(" . ")}</span>
                    <span className="price-hint">From{money(destination.dailyEstimate)}/day*</span>
                </span>
            </button>
        </article>
    );
}
function PlannerPage({
    preferences,
    updatePreference,
    toggleInterest,
    selectedDestination,
    onGenerate,
    onBack
}){
    const [step,setStep]=useState(1);
    const [errors,setErrors]=useState("");
    const totalBudget=Math.max(0,Number(preferences.budget) || 0);
    const travelers=Math.max(1,Number(preferences.travelers) || 1);
    const days=Math.max(1,Number(preferences.days) || 1);
    const perPerson=totalBudget/travelers;
    const perDay= perPerson/days;
    function goNext(){
        if(step===1 && !preferences.destinationId){
            setErrors("Choose a destination to continue.");
            return;
        }
        if(step===2 && preferences.interests.length===0){
            setErrors("Choose at least one interest.");
            return;
        }
        setErrors("");
        setStep((old)=>Math.min(3,old + 1));
    }
    function goBack(){
        setErrors("");
        if(step>1) setStep((old)=>old-1);
        else onBack();
    }
    return(
        <section className="planner-page">
            <button className="bacl-link" onClick={goBack}>
                <ArrowLeft size={16}/> {step===1? "Back to Discover": "Previous step"}
            </button>
            <div className="planner-heading">
                <span className="eyebrow"><Sparkles size={14}/> THE ARTOF YOUR ADVENTURE</span>
                <h1>Your trip, <em>your way.</em></h1>
                <p>Three simple steps to a plan that feels like you, something taht you choose to do.</p>
            </div>
            <div className="step-progress">
                {[1,2,3].map((item)=>(
                    <div className={`step-item ${step>=item ? "step-active":""}`} key={item}>
                        <span className="step-number">{step>item ? <Check size={15}/>:item}</span>
                        <span>{["Destination","Your interests","Budget & pace"][item-1]}</span>
                    </div>
                ))}
            </div>
            <div className="planner-layout">
                <div className="planner-form">
                    {step===1 &&(
                        <div className="form-panel">
                            <span className="panel-kicker">01 - THE DESTINATION</span>
                            <h2>Where are we going?</h2>
                            <p>Choose you destination and tell me how long you'll be away.</p>
                            <div className="form-field">
                                <label htmlFor="destination">Destination</label>
                                <select 
                                    id="destination"
                                    value={preferences.destinationId}
                                    onChange={(event)=> updatePreference("destinationId",event.target.value)}
                                >
                                    {destinations.map((item)=>(
                                        <option value={item.id} key={item.id}>
                                            {item.name}, {item.country}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-grid">
                                <div className="form-field">
                                    <label htmlFor="days">Length of stay</label>
                                    <div className="number-control">
                                        <button 
                                            onClick={()=>updatePreference("days",Math.max(1,days-1))}
                                            aria-label="Decrease trip length"
                                        ><Minus size={16}/></button>
                                        <strong>{days} {days===1? "day":"days"}</strong>
                                        <button 
                                            onClick={()=> updatePreference("days",Math.min(30, days+1))}
                                            aria-label="Increase trip length"
                                        ><Plus size={16}/></button>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label htmlFor="travelers">Travelers</label>
                                    <div className="number-control">
                                        <button 
                                            onClick={()=>updatePreference("travelers", Math.max(1, travelers -1))}
                                            aria-label="Decrease travelers"
                                        ><Minus size={16}/></button>
                                        <strong>{travelers} {travelers===1? "person":"people"}</strong>
                                        <button 
                                            onClick={()=>updatePreference("travelers",Math.min(20,travelers +1))}
                                            aria-label="increase travelers"
                                        ><Plus size={16}/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="food">Food preferences</label>
                                <select 
                                    id="food"
                                    value={preferences.foodPreferences}
                                    onChange={(event)=> updatePreference("foodPreference",event.target.value)}
                                >
                                    <option value="local">Local food & specialities</option>
                                    <option value="vegetarian">Vegetarian.friendly</option>
                                    <option value="mixed">A bit of everything</option>
                                    <option value="budget">Budget-friendly meals</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="accommodation">Accommodation style</label>
                                <select    
                                    id="accommodation"
                                    value={preferences.accommodation}
                                    onChange={(event)=> updatePreference("accommodation",event.target.value)}
                                >
                                    <option value="budget">Budget / hostel</option>
                                    <option value="comfortable">Comfortable hotel</option>
                                    <option value="premium">Premium stay</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {step===2 &&(
                        <div className="form-panel">
                            <span className="panel-licker">02 - WHAT YOU LOVE</span>
                            <h2>Make it feel liyou and choose what you love.</h2>
                            <p>Select the things you would love to experience.</p>
                            <div className="interest-grid">
                                {interests.map((interest)=>{
                                    const selected=preferences.onterests.includes(interest.id);
                                    return(
                                        <button 
                                            className={`interest-option ${selected ?"interest-selected":""}`}
                                            key={interest.id}
                                            onClick={()=>toggleInterest(interest.id)}
                                            aria-pressed={selected}
                                        >
                                            <span className="interest-emoji">{interest.emoji}</span>
                                            <span>{interest.label}
                                                {selected && <Check size={14}/>}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="form-field pace-field">
                                <label>What kind of pace feels right?</label>
                                <div className="pace-options">
                                    {[
                                        {id:"relaxed",title:"Slow and easy",description:"Room to brathe",emoji:"☮︎˚࿔"},
                                        {id:"balanced",title:"Alittle of both",description:"A balanced rhythme",emoji:"⚖️"},
                                        {id:"packed",title:"Make it count",description:"More to discover",emoji:"🔥"}
                                    ].map((item)=>(
                                        <button 
                                            key={item.id}
                                            className={`pace-option ${preferences.pace===item.id?"pace-selected":""}`}
                                            onClick={()=> updatePreference("pace",item.id)}
                                            aria-pressed={preferences.pace===item.id}
                                        >
                                            <span>{item.emoji}</span>
                                            <strong>{item.title}</strong>
                                            <small>{item.description}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div> 
                    )}
                    {step===3 &&(
                        <div className="form-panel">
                            <span className="panel-kicker">03 - THE PRACTICAL DETAILS</span>
                            <h2>Let's talk budget.</h2>
                            <p>Set your total budget for this trip, including everyone travelling.</p>
                            <div className="form-field">
                                <label htmlFor="currency">Currency</label>
                                <select 
                                    id="currency"
                                    value={preferences.currency}
                                    onChange={(event)=>updatePreference("currency",event.target.value)}
                                >
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="USD">USD - Us dollar</option>
                                    <option value="GBP">GBP - Pound sterling</option>
                                </select>
                                <span className="field-hint">
                                    Changing currency changes the display only. It does not convert prices.
                                </span>
                            </div> 
                            <div className="budget-entry">
                                <label htmlfor="budget">Total trip budget</label>
                                <div className="budget-input-wrap">
                                    <span>{preferences.currency}</span>
                                    <input 
                                        id="budget"
                                        type="number"
                                        min="0"
                                        step="50"
                                        value={preferences.budget}
                                        onChange={(event)=>updatePreference(
                                            "budget",
                                            Math.max(0,Number(event.target.value) || 0)
                                        )}
                                    />
                                </div>
                                <input 
                                    aria-label="Adjust trip budget"
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="50"
                                    value={Math.min(10000,Math.max(100,totalBudget))}
                                    onChange={(event)=>updatePreference("budget",Number(event.target.value))}
                                />
                                <div className="range-labels"><span>100</span><span>10,000</span></div>
                            </div>
                            <div className="budget-summary">
                                <div><span>Budget per person</span><strong>{money(perPerson,preferences.currency)}</strong></div>
                                <div><span>Budget per person / day</span><strong>{money(perDay,preferences.currency)}</strong></div>
                            </div> 
                            <div className="info-note">
                                <Wallet size={18}/>
                                <p>I'll estimate accommodation, food, local transport and activities.Flights are not included in this first version.</p>
                            </div>
                        </div> 
                    )}
                    {errors && <p className="form-error" role="alert">{errors}</p>}
                    <div className="form-navigation">
                        <span>Step {step} of 3</span>
                        {step<3?(
                            <button className="button button-primary" onClick={goNext}>
                                Continue<ArrowRight size={17}/>
                            </button>
                        ):(
                            <button className="button button-primary" onClick={onGenerate}>
                                <Sparkles size={17}/> Generate my trip
                            </button>
                        )}
                    </div>
                </div>
                <aside className="planner-aside">
                    <div className="aside-image">
                        <img src={selectedDestination.image} alt={selectedDestination.name}/>
                        <span className="aside-image-label"><MapPin size={13}/>YOUR DESTINATION</span>
                    </div>
                    <div className="aside-content">
                        <span className="destination-country">{selectedDestination.country}</span>
                        <h3>{selectedDestination.name}</h3>
                        <p>{selectedDestination.description}</p>
                        <div className="aside-divider"/>
                        <div className="aside-stat">
                            <CalendarDays size={17}/>
                            <span>Duration</span><strong>{days} days</strong>
                        </div>
                        <div className="aside-stat">
                            <Users size={17}/>
                            <span>Travelers</span><strong>{travelers}</strong>
                        </div>
                        <div className="aside-stat">
                            <Wallet size={17}/>
                            <span>Total budget</span><strong>{money(totalBudget,preferences.currency)}</strong>
                        </div>
                        <div className="aside-tip">
                            <Sparkles size={16}/>
                            <span>Your itinerary will adapt to your interests and preferred pace.</span>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
function ItineraryPage({
    trip,
    activeDay,
    setActiveDay,
    onBack,
    onEdit,
    onExport,
    onShare,
    isComplete,
    toggleComplete
}){
    const{itinerary,preferences}=trip;
    const day=itinerary.days[activeDay]?? itinerary.days[0];
    const currency=preferences.currency;
    const completedCount=itinerary.days.reduce(
        (total,item)=>total+item.activities.filter(
            (activity)=> isComplete(trip.id,item.day,activity.id)
        ).length,
        0
    );
    const totalActivities=itinerary.days.reduce(
        (total,item)=>total+item.activities.length,
        0
    );
    const progress=totalActivities 
        ?Math.round(completedCount/totalActivities*100)
        :0;
        return(
            <section className="itinerary-page">
                <button className="back-link" onClick={onBack}>
                    <ArrowLeft size={16}/>My trips
                </button>
                <div className="itinerary-hero">
                    <div className="itinerary-hero-image">
                        <img src={itinerary.destination.image} alt={itinerary.destination.nme}/>
                    </div>
                    <div className="itinerary-hero-copy">
                        <span className="eyebrow"><Sparkles size={14}/>YOUR PERSONALITINERARY</span>
                        <h1>{itinerary.destination.name},<em>your way.</em></h1>
                        <p>{itinerary.destination.description}</p>
                        <div className="itinerary-meta">
                            <span><CalendarDays size={16}/> {preferences.days}days</span>
                            <span><Users size={16}/>{preferences.travelers} travelers</span>
                            <span><Wallet size={16}/> {money(itinerary.totalBudget,currency)} budget</span>
                        </div>
                        <div className="itinerary-actions">
                            <button className="button button-primary" onClick={onExport}>
                                <Download size={16}/> Export plan
                            </button>
                            <button className="button button-outline" onClick={onShare}>
                                <Share2 size={16}/> Share
                            </button>
                            <button className="button button-outline" onClick={onEdit}>
                                Edit preferences
                            </button>
                        </div>
                    </div>
                </div>
                <div className="itinerary-stats">
                    <div className="stats-card">
                        <span className="stat-icon"><Wallet/></span>
                        <span className="stat-label">Estimated total</span>
                        <strong>{money(itinerary.estimatedTotal,currency)}</strong>
                        <small>For {preferences.travelers} travelers</small>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><CalendarDays/></span>
                        <span className="stat-label">Daily estimate</span>
                        <strong>{money(itinerary.estimatedTotal/preferences.days,currency)}</strong>
                        <small>Average per day, group total</small>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><Check/></span>
                        <span className="stat-label">Your progress</span>
                        <strong>{progress}%</strong>
                        <div className="progress-track"><span style={{width:`${progress}%`}}/></div>
                        <small>{completedCount} of {totalActivities} activities</small>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><Wallet/></span>
                        <span className="stat-label">Budget balance</span>
                        <strong className={itinerary.remainingBudget<0? "over-budget":""}>
                            {money(itinerary.remainingBudget,currency)}
                        </strong>
                        <small>{itinerary.remainingBudget <0? "Above your budget":"Estimated remaining"}</small>
                    </div>
                </div>
                <div className="itinerary-body">
                    <aside className="day-sidebar">
                        <div classNme="sidebar-title">
                            <span className="eyebrow">YOUR JOURNEY</span>
                            <h3>Day by day</h3>
                        </div>
                        <div className="day-list">
                            {itinerary.days.map((item,index)=>{
                                const done=item.activities.filter(
                                    (activity)=>isComplete(trip.id,item.day,activity.id)
                                ).length;
                                const active=activeDay===index;
                                return(
                                    <button 
                                        key={item.day}
                                        className={`day-list-item ${active? "day-selected":""}`}
                                        onClick={()=>setActiveDay(index)}
                                >
                                    <span className="day-number">{String(item.day).padStart(2,"0")}</span>
                                    <span className="day-info">
                                        <strong>Day {item.day}</strong>
                                        <small>{item.title}</small>
                                        <small>{done}/{item.activities.length} complete</small>
                                    </span>
                                    <ArrowRight size={15}/>
                                </button>
                                );
                            })}
                        </div>
                        <div className="sidebar-budget">
                            <span><Wallet size={17}/> Trip budget</span>
                            <strong>{money(itinerary.totalBudget,currency)}</strong>
                            <small>Estimated spend: {money(itinerary.estimatedTotal,currency)}</small>
                        </div>
                    </aside>
                    <div className="day-detail">
                        <div className="day-detail-heading">
                            <div>
                                <span className="eyebrow">DAY {String(day.day).pasStart(2,"0")}</span>
                                <h2>{day.title}</h2>
                                <p>A suggested rhythm for your day. Adjust it as you like.</p>
                            </div>
                            <div className="day-cost">
                                <span>Estimated day cost</span>
                                <strong>{money(day.estimatedCostForGroup,currency)}</strong>
                            </div>
                        </div>
                        <div className="daily-timeline">
                            {day.activities.map((activity,index)=>{
                                const done=isComplete(trip.id,day.day,activity.id);
                                return(
                                    <article className={`activity-card ${done?"activity-done":""}`} key={`${day.day}-${activity.id}-${index}`}>
                                        <div className="activity-time">
                                            <span className="activity-time-dot"/>
                                            <span>{activity.time}</span>
                                        </div>
                                        <div className="activity-main">
                                            <div className="activity-emoji">{activity.emoji}</div>
                                            <div className="activity-copy">
                                                <h3>{activity.title}</h3>
                                                <p>{activity.description}</p>
                                                <div className="activity-meta">
                                                    <span><Clock3 size={14}/>{durationLabel(activity.duration)}</span>
                                                    <span><Wallet size={14}/>{money(activity.cost,currency)}/person*</span>
                                                    <span>{activity.outdoor?"Outdoors":"Indoors"}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className={`complete-button ${done? "complete-active":""}`}
                                                onClick={()=>toggleComplete(trip.id,day.day,activity.id)}
                                                aria-label={done? "Mark activity incomplete": "Mark activity complete"}
                                            >
                                                {done? <Check size={18}/>:<Plus size={18}/>}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        <div className="day-footer">
                            <button 
                                className="button button-outline"
                                onClick={()=> setActiveDay(Math.max(0,activeDay-1))}
                                disabled={activeDay===0}
                            >
                                <ArrowLeft size={16}/> Previous day
                            </button>
                            <span>{activeDay+1} of {itinerary.days.length}</span>
                            <button 
                                className="button button-primary"
                                onClick={()=>setActiveDay(Math.min(itinerary.days.length-1,activeDay+1))}
                                disabled={activeDay===itinerary.days.length-1}
                            >
                                Next day <ArrowRight size={6}/>
                            </button>
                        </div>
                        <p className="estimate-disclaimer">
                            *All activity costs are illustrative estimates. Check opening hours,accesibility, availability and actual prices before travelling.Flights, insurance and unexpected costs are not included so always plan a little more money.
                        </p>
                    </div>
                </div>
                <section className="budget-breakdown">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">KNOW BEFORE YOU GO</span>
                            <h2>Your budget, <em>at a glance.</em></h2>
                        </div>
                    </div>
                    {Object.entries(itinerary.totals).map(([key,value])=>{
                        const total =itinerary.estimatedTotal || 1;
                        const labels={
                            hotel:"Accommodation",
                            food:"Food & drinks",
                            transport:"Local transport",
                            activities:"Activities"
                        };
                        const percent=Math.round(value/total*100);
                        return(
                            <div className="budget-row" key={key}>
                                <div className="budget-row-top">
                                    <span>{labels[key]}</span>
                                    <strong>{money(value,currency)}</strong>
                                </div>
                                <div className="budget-bar">
                                    <span style={{width:`${percent}%`}}/>
                                </div>
                                <small>{percent}% of estimated trip cost</small>
                            </div>
                        );
                    })}
                    <p className="estimate-disclaimer">
                        This breakdown uses sample estimates. It is not a quote or guarantee of the amout you will spend.
                    </p>
                </section>
            </section>
        );
    }
function TripsPage({trips,onOpen,onDelete,onCreate}){
    return(
        <section className="collection-page">
            <div className="collection-heading">
                <div>
                    <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
                    <h1>All your <em>adventures.</em></h1>
                    <p>Keep your plans together and pick up where you left off.</p>
                </div>
                <button className="button button-primary" onClick={onCreate}>
                    <Plus size={17}/> New trip
                </button>
            </div>
            {trips.length===0?(
                <div className="empty-state large-empty">
                    <span className="empty-icon"><Compass size={30}/></span>
                    <h2>Your next adventure is waiting.</h2>
                    <p>Start planning and your trips will appear here.</p>
                    <button className="button button-primary" onClick={onCreate}>
                        Plan my first trip <ArrowRight size={16}/>
                    </button>
                </div>
            ):(
                <div className="saved-trip-grid">
                    {trips.map((trip)=>(
                        <article className="saved-trip-card" key={trip.id}>
                            <button className="saved-trip-image" onClick={()=>onOpen(trip)}>
                                <img src={trip.itinerary.destination.image} alt={trip.title}/>
                                <span className="image-region">{trip.preferences.days} days</span>
                            </button>
                            <div className="saved-trip-copy">
                                <span className="destination-country">{trip.itinerary.destination.country}</span>
                                <h3>{trip.title}</h3>
                                <p>
                                    <Users size={14}/> {trip.preferences.travelers} travelers
                                    <span>.</span>
                                    <Wallet size={14}/> {money(trip.itinerary.estimatedTotal,trip.preferences.currency)}
                                </p>
                                <div className="saved-trip-actions">
                                    <button className="button button-primary" onClick={()=>onOpen(trio)}>
                                        Open trip <ArrowRight size={15}/>
                                    </button>
                                    <button 
                                        className="icon-button danger-button"
                                        onClick={()=>{
                                            if (window.confirm("Delete this saved trip?")) onDelete(trip.id);
                                        }}
                                        aria-label="Delete saved trip"
                                    ><X size={17}/></button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
function SavedPage({favorites, onToggle, onPlan}){
    const savedDestinations=destinations.filter((item)=>favorites.includes(item.id));
    return(
        <section className="collection-page">
            <div className="collection-heading">
                <div>
                    <span className="eyebrow">THE PLACES THAT STAY WHITH YOU</span>
                    <h1>Places worth <em>remembering.</em></h1>
                    <p>Save destinations now, turn them into adventure later.</p>
                </div>
            </div>
            {savedDestinations.length===0?(
                <div className="empty-state large-empty">
                    <span className="empty-icon"><Heart size={30}/></span>
                    <h2>Start your wish list.</h2>
                    <p>Tap the heart on any destination to keep it here.</p>
                    <button className="button button_primary" onClick={()=>onPlan()}>
                        Find my next trip <ArrowRight size={16}/>
                    </button>                
                </div>
            ):(
                <div className="destination-grid">
                    {savedDestinations.map((destination)=>(
                        <DestinationCard
                            key={destination.id}
                            destination={destination}
                            onSelect={()=>onPlan(destinations.id)}
                            favorite
                            onFavorite={()=>onToggle(destination.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
export default App;