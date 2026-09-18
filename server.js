const express = require("express");
const path = require("path");

const {
    missions,
    astronauts,
    schemas
} = require("./data/data");

const app = express();
const PORT = 3000;


/* Initial Data */

const initialMissions = missions.map((mission) => ({ ...mission }));
const initialAstronauts = astronauts.map((astronaut) => ({ ...astronaut }));


/* App Configuration */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


/* Stage Rules */

const stageRules = {

    1: {
        method: "GET",
        path: "/api/missions"
    },

    2: {
        method: "GET",
        path: "/api/missions/2"
    },

    3: {
        method: "GET",
        path: "/api/missions",
        query: {
            status: "active",
            sort: "duration"
        }
    },

    4: {
        method: "POST",
        path: "/api/missions",
        body: {
            name: "Jupiter Survey",
            destination: "Jupiter",
            duration: 45,
            status: "planned"
        }
    },

    5: {
        method: "PATCH",
        path: "/api/missions/3",
        body: {
            status: "active"
        }
    },

    6: {
        method: "DELETE",
        path: "/api/missions/4"
    },

    7: {
        method: "GET",
        path: "/api/missions/1/astronauts"
    },

    8: {
        method: "GET",
        path: "/api/astronauts/999"
    }

};


/* Helper Functions */

function normalizePath(req) {

    let requestPath = req.originalUrl.split("?")[0];

    if (requestPath.length > 1 && requestPath.endsWith("/")) {
        requestPath = requestPath.slice(0, -1);
    }

    return requestPath;
}


function objectsMatch(actual, expected) {

    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);

    if (actualKeys.length !== expectedKeys.length) {
        return false;
    }

    return expectedKeys.every((key) => {
        return String(actual[key]) === String(expected[key]);
    });
}


function checkStage(req) {

    const stageId = Number(req.get("x-stage-id"));

    if (!stageId || !stageRules[stageId]) {
        return null;
    }

    const rule = stageRules[stageId];

    const methodCorrect =
        req.method.toUpperCase() === rule.method;

    const pathCorrect =
        normalizePath(req) === rule.path;

    let queryCorrect = true;

    if (rule.query) {
        queryCorrect = objectsMatch(req.query, rule.query);
    } else {
        queryCorrect = Object.keys(req.query).length === 0;
    }

    let bodyCorrect = true;

    if (rule.body) {
        bodyCorrect = objectsMatch(req.body, rule.body);
    }

    const correct =
        methodCorrect &&
        pathCorrect &&
        queryCorrect &&
        bodyCorrect;

    return {
        stageId,
        correct,
        message: correct
            ? "Correct request!"
            : "The request does not match the requirements of this stage."
    };
}


function buildResponse(req, data, message = null) {

    const stageResult = checkStage(req);

    return {
        correct: stageResult
            ? stageResult.correct
            : null,

        feedback: stageResult
            ? stageResult.message
            : null,

        message,
        data
    };
}


function mutationAllowed(req, res) {

    const stageResult = checkStage(req);

    if (stageResult && !stageResult.correct) {

        res.status(400).json({
            correct: false,
            feedback: stageResult.message,
            message: "The request was not applied.",
            data: null
        });

        return false;
    }

    return true;
}


/* Page Routes */

app.get("/", (req, res) => {

    res.render("index");

});


app.get("/schemas", (req, res) => {

    res.render("schemas", {
        schemas
    });

});


/* GET All Missions */

app.get("/api/missions", (req, res) => {

    let result = [...missions];

    if (req.query.status) {

        result = result.filter((mission) => {
            return mission.status === req.query.status;
        });

    }


    if (req.query.sort === "duration") {

        result.sort((a, b) => {
            return a.duration - b.duration;
        });

    }


    res.status(200).json(
        buildResponse(
            req,
            result,
            "Missions retrieved successfully."
        )
    );

});


/* GET Astronauts for a Mission */

app.get("/api/missions/:id/astronauts", (req, res) => {

    const missionId = Number(req.params.id);

    const mission = missions.find((item) => {
        return item.id === missionId;
    });


    if (!mission) {

        return res.status(404).json(
            buildResponse(
                req,
                null,
                "Mission not found."
            )
        );

    }


    const missionAstronauts = astronauts.filter((astronaut) => {
        return astronaut.missionId === missionId;
    });


    res.status(200).json(
        buildResponse(
            req,
            missionAstronauts,
            "Astronauts retrieved successfully."
        )
    );

});


/* GET One Mission */

app.get("/api/missions/:id", (req, res) => {

    const missionId = Number(req.params.id);

    const mission = missions.find((item) => {
        return item.id === missionId;
    });


    if (!mission) {

        return res.status(404).json(
            buildResponse(
                req,
                null,
                "Mission not found."
            )
        );

    }


    res.status(200).json(
        buildResponse(
            req,
            mission,
            "Mission retrieved successfully."
        )
    );

});


/* POST Mission */

app.post("/api/missions", (req, res) => {

    if (!mutationAllowed(req, res)) {
        return;
    }


    const {
        name,
        destination,
        duration,
        status
    } = req.body;


    if (!name || !destination || !duration || !status) {

        return res.status(400).json(
            buildResponse(
                req,
                null,
                "Missing required mission fields."
            )
        );

    }


    const newMission = {

        id:
            missions.length > 0
                ? Math.max(...missions.map((mission) => mission.id)) + 1
                : 1,

        name,
        destination,
        duration: Number(duration),
        status

    };


    missions.push(newMission);


    res.status(201).json(
        buildResponse(
            req,
            newMission,
            "Mission created successfully."
        )
    );

});


/* PATCH Mission */

app.patch("/api/missions/:id", (req, res) => {

    if (!mutationAllowed(req, res)) {
        return;
    }


    const missionId = Number(req.params.id);

    const mission = missions.find((item) => {
        return item.id === missionId;
    });


    if (!mission) {

        return res.status(404).json(
            buildResponse(
                req,
                null,
                "Mission not found."
            )
        );

    }


    const allowedFields = [
        "name",
        "destination",
        "duration",
        "status"
    ];


    allowedFields.forEach((field) => {

        if (req.body[field] !== undefined) {

            mission[field] =
                field === "duration"
                    ? Number(req.body[field])
                    : req.body[field];

        }

    });


    res.status(200).json(
        buildResponse(
            req,
            mission,
            "Mission updated successfully."
        )
    );

});


/* DELETE Mission */

app.delete("/api/missions/:id", (req, res) => {

    if (!mutationAllowed(req, res)) {
        return;
    }


    const missionId = Number(req.params.id);

    const missionIndex = missions.findIndex((item) => {
        return item.id === missionId;
    });


    if (missionIndex === -1) {

        return res.status(404).json(
            buildResponse(
                req,
                null,
                "Mission not found."
            )
        );

    }


    const deletedMission =
        missions.splice(missionIndex, 1)[0];


    res.status(200).json(
        buildResponse(
            req,
            deletedMission,
            "Mission deleted successfully."
        )
    );

});


/* GET All Astronauts */

app.get("/api/astronauts", (req, res) => {

    res.status(200).json(
        buildResponse(
            req,
            astronauts,
            "Astronauts retrieved successfully."
        )
    );

});


/* GET One Astronaut */

app.get("/api/astronauts/:id", (req, res) => {

    const astronautId = Number(req.params.id);

    const astronaut = astronauts.find((item) => {
        return item.id === astronautId;
    });


    if (!astronaut) {

        return res.status(404).json(
            buildResponse(
                req,
                null,
                "Astronaut not found."
            )
        );

    }


    res.status(200).json(
        buildResponse(
            req,
            astronaut,
            "Astronaut retrieved successfully."
        )
    );

});


/* Reset Server Data */

app.post("/api/reset", (req, res) => {

    missions.splice(
        0,
        missions.length,
        ...initialMissions.map((mission) => ({ ...mission }))
    );

    astronauts.splice(
        0,
        astronauts.length,
        ...initialAstronauts.map((astronaut) => ({ ...astronaut }))
    );


    res.status(200).json({
        correct: null,
        feedback: null,
        message: "Game data reset successfully.",
        data: null
    });

});


/* Unknown API Route */

app.use("/api", (req, res) => {

    res.status(404).json(
        buildResponse(
            req,
            null,
            "API route not found."
        )
    );

});


/* Invalid JSON */

app.use((error, req, res, next) => {

    if (error instanceof SyntaxError) {

        return res.status(400).json({
            correct: false,
            feedback: "Invalid JSON body.",
            message: "The request body contains invalid JSON.",
            data: null
        });

    }

    next(error);

});


/* Start Server */

app.listen(PORT, () => {

    console.log(
        `Server is running at http://localhost:${PORT}`
    );

});