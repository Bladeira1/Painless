export const destinations=[
    {
        id:"lisbon",
        name:"Lisbon",
        country:"Portugal",
        region:"Europe",
        emoji:"🌊",
        image:"./images/lisbon.jxl",
        description:"Sunlit steets,ocean and beach vibes, and unforgettable food.",
        dailyEstimate:105,
        hotelEstimate:65,
        tags:["Culture","Food","Ocean","Beach","Sunny days"]
    },
    {
        id:"rome",
        name:"Rome",
        country:"Italiy",
        region:"Europe",
        emoji:"🏛️",
        image:"./images/rome.jpg",
        description:"Ancient history, beautiful monuments and the best Italian cuisine.",
        dailyEstimate:145,
        hotelEstimate:95,
        tags:["Culture","Food","History","Monuments"]
    },
    {
        id:"tokyo",
        name:"Tokyo",
        country:"Japan",
        region:"Asia",
        emoji:"🌸",
        image:"./images/tokyo.jpg",
        description:"An exited mix of tradition,design,thechnology,modern life and the most vibrant and beautiful colors.",
        dailyEstimate:135,
        hotelEstimate:85,
        tags:["Culture","Food","Adventure","tradition"]
    },
    {
        id:"barcelona",
        name:"Barcelona",
        country:"Spain",
        region:"Europe",
        emoji:"☀️",
        image:"./images/barcelona.jpg",
        description:"Architecture, Mediterranean beaches, incredible Tapas and lovely people and streets.",
        dailyEstimate:125,
        hotelEstimate:80,
        tags:["Culture","Beach","Food","Community"]
    },
    {
        id:"bali",
        name:"Bali",
        country:"Indonesia",
        region:"Asia",
        emoji:"🌴",
        image:"./images/bali.jpg",
        description:"Green landscapes,temple and tropical adventure.",
        dailyEstimate:90,
        hotelEstimate:50,
        tags:["Nature","Adventure","Relaxation","Isolation"],
    },
    {
        id:"new-york",
        name:"New York",
        country:"United States",
        region:"North America",
        emoji:"🌆",
        image:"./images/new-york.webp",
        description:"Iconic skylines,museums, endless land and incredible/famous people. ",
        dailyEstimate:210,
        hotelEstimate:155,
        tags:["Culture","Fast Food","City","Famous","Arstis"]
    }
];
export const interests=[
    {id:"culture",label:"Culture",emoji:"🌎"},
    {id:"food",label:"Food & gastronomy",emoji:"😋🍽️"},
    {id:"nature",label:"Nature",emoji:"🍃"},
    {id:"adventure",label:"Adventure & sports",emoji:"🗺️🧗"},
    {id:"history",label:"History",emoji:"📜"},
    {id:"beach",label:"Beaches",emoji:"🏖️"},
    {id:"nightlife",label:"Nightlife",emoji:"🌙"},
    {id:"relaxation",label:"Relaxation",emoji:"🧘🏻‍♀️"},
    {id:"shopping",label:"Shopping",emoji:"🛍️"}
];
export const activities=[
    {
        id:"museum",
        title:"Eplore a local museum",
        category:"culture",
        emoji:"🏛️",
        duration:120,
        cost:15,
        time:"Morning",
        description:"Discover local art,stories and history.",
        intensity:1,
        tags:["culture","history"],
        outdoor:false
    },
    {
        id:"walking-tour",
        title:"Walk and visit everything",
        category:"culture",
        emoji:"🚶",
        duration:90,
        cost:0,
        time:"Morning",
        description:"See landmarks, discover hidden corners, and every beauty of the city.",
        intensity:2,
        tags:["culture","history","adventure"],
        outdoor:true
    },
    {
        id:"local-market",
        title:"Visit a local food market",
        category:"food",
        emoji:"🥐",
        duration:60,
        cost:18,
        time:"Morning",
        description:"Try regional specialties, meet local vendors and try that food you always dreamed about.",
        intensity:1,
        tags:["food","culture"],
        outdoor:true
    },
    {
        id:"food-expireience",
        title:"Try a local food expirience",
        category:"food",
        emoji:"🍽️",
        duration:90,
        cost:28,
        time:"Lunch",
        description:"Enjoy a meal inspired by regional traditions.",
        intensity:1,
        tags:["foods"],
        outdoor:false
    },
    {
        id:"viewpoint",
        title:"Find a beautiful viewpoint",
        category:"nature",
        emoji:"🌅",
        duration:60,
        cost:0,
        time:"Afternoon",
        description:"Take a breack and enjoy the landscape",
        intensity:2,
        tags:["nature","relaxation"],
        outdoor:true
    },
    {
        id:"hike",
        title:"Go on a nature walk",
        category:"adventure",
        emoji:"🏔️",
        duration:150,
        cost:0,
        time:"Morning",
        description:"Explore a trail suited to your chosen pace and local preferences.",
        intensity:3,
        tags:["nature","adventure"],
        outdoor:true
    },
    {
        id:"bike",
        title:"Explore by bicycle",
        category:"adventure",
        emoji:"🚲",
        duration:120,
        cost:10,
        time:"Afternoon",
        description:"Discover more of the city at your own pace.",
        intensity:3,
        tags:["adventure","nature"],
        outdoor:true
    },
    {
        id:"beach",
        title:"Spend time by the water",
        category:"beach",
        emoji:"🏝️🍹⛱️🌞 🌊",
        duration:120,
        cost:0,
        time:"Afternoon",
        description:"Enjoy a relaxed break besides the water and enjoy the sun.",
        intensity:1,
        tags:["beach","relaxation"],
        outdoor:true
    },
    {
        id:"architecture",
        title:"Discover local architecture",
        category:"culture",
        emoji:"🏙️",
        duration:90,
        cost:10,
        time:"Afternoon",
        description:"Notice the details that make the destination unique.",
        intensity:1,
        tags:["culture","history"],
        outdoor:true
    },
    {
        id:"park",
        title:"Tale a break in a green space",
        category:"relaxation",
        emoji:"🌳",
        duration:60,
        cost:0,
        time:"Afternoon",
        description:"Slow sown and leave room for spontaneous discoveries and connect with nature.",
        intensity:1,
        tags:["relaxation","nature"],
        outdoor:true
    },
    {
       id:"night-walk",
       title:"Enjoy an evening walk",
       category:"nightlife",
       emoji:"🌃",
       duration:60,
       cost:0,
       time:"Evening",
       description:"Experience the destination and city after the sunset.",
       intensity:1,
       tags:["nightlife","culture"],
       outdoor:true
    },
    {
        id:"local-event",
        title:"Look for a local event",
        category:"culture",
        emoji:"🎭🧑‍🤝‍🧑",
        duration:120,
        cost:20,
        time:"Evening",
        description:"Discover music,performances or community events.",
        intensity:1,
        tags:["culture","community"],
        outdoor:false
    },
    {
        id:"shopping",
        title:"Explore shops",
        category:"shopping",
        emoji:"🛍️",
        duration:90,
        cost:35,
        time:"Afternoon",
        description:"Find clothes, gifts, art, everything you wanted to buy from this country,now's the opportunity.",
        intensity:1,
        tags:["shopping","culture"],
        outdoor:false
    }
];
export function generateItinerary(preferences){
    const{
        destinationId,
        days,
        budget,
        travelers,
        interests:selectedInterests,
        pace
    }=preferences;
    const destination=
        destinations.find((item)=>item.id===destinationId)??
        destinations[0];
    const numberOfDays=Math.max(
        1,
        Math.min(30,Number(days) || 1)
    );
    const people=Math.max(1,Number(travelers) || 1);
    const totalBudget=Math.max(0,Number(budget) || 0);
    const chosen = selectedInterests?.length
        ? selectedInterests
        :["culture","food","nature"];
    const activitiesPerDay=
        pace==="relaxed" ? 2 : pace==="packed"? 4:3;
    const pool=activities
        .filter((activity)=>
            activity.tags.some((tag)=>chosen.includes(tag))
        )
        .sort((a,b)=>a.cost-b.cost);
    const fallbackPool=pool.length? pool:activities;
    const dailyBudgetPerPerson=totalBudget/people/numberOfDays;
    const hotelPerDay=destination.hotelEstimate;
    const estimatedFoodPerDay=25;
    const estimatedTransportPerDay=10;
    const dailyPlans=[];
    for (let day=0; day<numberOfDays;day +=1){
        const selected=[];
        let cursor=day%fallbackPool.length;
        while(
            selected.length<activitiesPerDay &&
            selected.length<fallbackPool.length
        ) {
            const candidate=fallbackPool[cursor%fallbackPool.length];
            cursor +=1;
            if(!selected.some((item)=>item.id===candidate.id)){
                selected.push(candidate);
            }
        }
        const activityCost =selected.reduce(
            (sum,item)=> sum+ item.cost,
            0
        );
        const dayCost=
            hotelPerDay+
            estimatedFoodPerDay+
            estimatedTransportPerDay+
            activityCost;
        dailyPlans.push({
            day:day+1,
            title:[
                "Discover & explore",
                "Culture & local flavors",
                "Adventure & hidden gems",
                "Slow down & enjoy",
                "Your own kind of adventure"
            ][day%5],
            activities:selected,
            estimatedCost:dayCost,
            estimatedCostForGroup:dayCost*people,
            budgetPerPerson:dailyBudgetPerPerson,
            estimatedHours:selected.reduce(
                (sum,item)=>sum +item.duration/60,
                0
            )
        });
    }
    const totals={
        hotel:hotelPerDay*numberOfDays*people,
        food:estimatedFoodPerDay*numberOfDays*people,
        transport:estimatedTransportPerDay*numberOfDays*people,
        activities:dailyPlans.reduce(
            (sum,day)=>
                sum+
                day.activities.reduce((subtotal,item)=>subtotal+item.cost,0),
            0
        )*people
    };
    const estimatedTotal=
    totals.hotel+totals.food+totals.transport+totals.activities;
    return{
        destination,
        days:dailyPlans,
        travelers:people,
        totalBudget,
        estimatedTotal,
        remainingBudget:totalBudget-estimatedTotal,
        totals,
        budgetPerPerson:totalBudget/people
    };
}