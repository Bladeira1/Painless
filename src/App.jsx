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
    )
}