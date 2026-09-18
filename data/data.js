const missions = [
    {
        id: 1,
        name: "Lunar Research",
        destination: "Moon",
        duration: 14,
        status: "active"
    },
    {
        id: 2,
        name: "Mars Explorer",
        destination: "Mars",
        duration: 30,
        status: "active"
    },
    {
        id: 3,
        name: "Venus Mapping",
        destination: "Venus",
        duration: 21,
        status: "planned"
    },
    {
        id: 4,
        name: "Asteroid Sample",
        destination: "Bennu",
        duration: 10,
        status: "completed"
    }
];


const astronauts = [
    {
        id: 1,
        name: "Alex Carter",
        role: "Commander",
        missionId: 1
    },
    {
        id: 2,
        name: "Maya Chen",
        role: "Scientist",
        missionId: 1
    },
    {
        id: 3,
        name: "Daniel Brooks",
        role: "Pilot",
        missionId: 2
    },
    {
        id: 4,
        name: "Sophia Reed",
        role: "Engineer",
        missionId: 2
    },
    {
        id: 5,
        name: "Liam Walker",
        role: "Researcher",
        missionId: 3
    }
];


const schemas = {
    missions: {
        resource: "missions",
        fields: [
            {
                name: "id",
                type: "Number"
            },
            {
                name: "name",
                type: "String"
            },
            {
                name: "destination",
                type: "String"
            },
            {
                name: "duration",
                type: "Number"
            },
            {
                name: "status",
                type: "String"
            }
        ]
    },

    astronauts: {
        resource: "astronauts",
        fields: [
            {
                name: "id",
                type: "Number"
            },
            {
                name: "name",
                type: "String"
            },
            {
                name: "role",
                type: "String"
            },
            {
                name: "missionId",
                type: "Number"
            }
        ]
    }
};


module.exports = {
    missions,
    astronauts,
    schemas
};