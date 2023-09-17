import * as express from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { User } from "../entity/User";

const data = require('../../projectconfig.json');
const saltRounds = 5;
const secret = data["jwt-secret"];

let router = express.Router();

router.post("/users", async function (req: Request, res: Response) {
        const conn = getConnection();
        const userRepository = conn.getRepository(User);

        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                try {
                        req.body.password = hash;
                        const user = userRepository.create(req.body);
                        var results = await userRepository.save(user);
                        var token = jwt.sign({ id: results["id"], "name": results["name"] }, secret);
                        res.cookie('token', token, { secure: true });
                        return res.status(200).send({ "token": token });
                } catch (err) {
                        return res.send(400);
                }
        });

});

router.post("/login", async function (req: Request, res: Response) {
        const conn = getConnection();
        const userRepository = conn.getRepository(User);
        const user = await userRepository.findOne({ email: req.body.email });
        if (user) {
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (result == true) {
                                var token = jwt.sign({ id: user.id, "name": user.name }, secret);
                                res.cookie('token', token, { secure: true });
                                return res.status(200).send({ "token": token });
                        } else {
                                return res.status(401).send("Invalid Password");
                        }
                });
        } else {
                return res.status(401).send("Invalid Email");
        }
});

export = router