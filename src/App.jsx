import {useEffect,useMemo,useState} from"react";
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
    const [trips,setTripId,setActiveTripId]=useState(null);
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
            localStorage.setItems(STORAGE_KEY, JSON.stringify(trips));
        }catch{
            setNotice("Storage is full export your trips before saving more.");
        }
    },[trips]);
    useEffect(()=>{
        if(!notice)return;
        const timeout=window.setTimeout(()=>setNotice(""),3000);
        return () =>window.clearTimeout(timeout);
    },[notice]);
    const filterDestinations=useMenu(()=>{
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
            day.activities.forEach((acticity)=>{
                lines.push(
                    `${activity.time} | ${activity.title} | ${durationLabel(acticity.duration)} | ${money(activity.cost,trip.preferences.currency)} per person`
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
        ? filteredDestinations
        : filteredDestinations.slice(0,4);
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
                    onClick={()=>setMobileMenu((old)=>!ols)}
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
                        onClick={()=> {setPage("saved"); setMobileMrnu(false);}}
                    >
                        Saved places
                    </button>
                </nav>
                <button className="topbar-cta" onClick={()=>openPlanner()}>
                    Start planning <ArrowUpRigth size={16} />
                </button>
            </header>
            <main>
                {page==="home"&&(
                    <HomePage
                        destinations={featuredDestinations}
                        search={search}
                        setSearch={setSearch}
                        openPlanner={openPlanner}
                        toggleFavorites={toggleFavorites}
                        favorites={favorites}
                        showAll={showAllDestinations}
                        setShowAll={setShowAllDestinations}
                        onOpenSaved={()=>setPage("saved")}
                    />
                )}
                {page==="planner"&&(
                    <Plannerpage
                        preferences={preferences}
                        updatePreferences={updatePreferences}
                        toggleInterests={toggleInterests}
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
                    Build my itinerary <Arrowright size={17}/>
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
                onClick={inSlect}
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
    toggleInterst,
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
            <div xlassName="planner-heading">
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
                                    {destination.map((item)=>(
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
                    
                </div>
            </div>
        </section>
    )
}