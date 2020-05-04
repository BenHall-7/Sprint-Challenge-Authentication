const auth = require("./auth-router");
const jokes = require("../jokes/jokes-router");
const serve = require("supertest");

const user = {
    username: "test",
    password: "password"
};

describe("auth_router", () => {
    describe("registration", () => {
        it("returns status 201 with token in the JSON body", async () => {
            const res = await serve(auth)
                .post("/register")
                .set('Accept', 'application/json')
                .send(user);

            expect(res.status).toBe(201);
            expect(typeof res.token).toBe("string");
        });

        it("returns status 400 with bad json body", async () => {
            const res = await serve(auth)
                .post("/register")
                .set('Accept', 'application/json')
                .send({...user, password: 0});

            expect(res.status).toBe(400);
        });

        it("returns status 500 if user already exists", async () => {
            const res = await serve(auth)
                .post("/register")
                .set('Accept', 'application/json')
                .send(user);

            expect(res.status).toBe(500);
        })
    })
});