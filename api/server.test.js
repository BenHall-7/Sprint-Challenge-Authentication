const server = require("./server");
const db = require("../database/dbConfig");
const serve = () => require("supertest")(server);

const user = {
    username: "test",
    password: "password"
};
let token = null;


describe("testing environment", () => {
    it("should be set to testing", () => {
        expect(process.env.DB_ENV).toBe("testing")
    });

    afterAll(() => {
        if (process.env.DB_ENV === "testing") {
            return db("users").del();
        } else {
            throw "ENVIRONMENT SET INCORRECTLY";
        }
    });
})

describe("register", () => {
    it("returns status 201 with token in the JSON body", async () => {
        const res = await serve()
            .post("/api/auth/register")
            .set('Accept', 'application/json')
            .send(user);

        expect(res.status).toBe(201);
        expect(typeof res.body.token).toBe("string");
    });

    it("returns status 400 with bad json body", async () => {
        const res = await serve()
            .post("/api/auth/register")
            .set('Accept', 'application/json')
            .send({...user, password: 0});

        expect(res.status).toBe(400);
    });

    it("returns status 500 if user already exists", async () => {
        const res = await serve()
            .post("/api/auth/register")
            .set('Accept', 'application/json')
            .send(user);

        expect(res.status).toBe(500);
    })
});

describe("login", () => {
    it("returns status 200 with token and user in the JSON body", async () => {
        const res = await serve()
            .post("/api/auth/login")
            .set('Accept', 'application/json')
            .send(user);

        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe("string");
        expect(typeof res.body.user).toBe("object");

        token = res.body.token;
    });

    it("returns status 400 with bad json body", async () => {
        const res = await serve()
            .post("/api/auth/login")
            .set('Accept', 'application/json')
            .send({...user, password: 0});

        expect(res.status).toBe(400);
    });

    it("returns status 401 with incorrect credentials", async () => {
        const res = await serve()
            .post("/api/auth/login")
            .set('Accept', 'application/json')
            .send({...user, password: "(* ^ ω ^)"});

        expect(res.status).toBe(401);
    });
});

describe("jokes", () => {
    it("returns status 200 and an array", async () => {
        const res = await serve()
            .get("/api/jokes")
            .set('Accept', 'application/json')
            .set('AUTHORIZATION', token);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('joke');
    });

    it("returns status 401 if no user authentication is given", async () => {
        const res = await serve()
            .get("/api/jokes")
            .set('Accept', 'application/json')

        expect(res.status).toBe(401);
    })
});