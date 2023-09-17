import * as express from "express";
import * as jwt from "express-jwt";
import * as crypto from "crypto";
import { Request, Response } from "express";
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import { Team } from "../entity/Team";
import { Channel } from "../entity/Channel";
import { Message } from "../entity/Message";
import * as moment from "moment";
const data = require('../../projectconfig.json');
let router = express.Router();
const secret = data["jwt-secret"];

router.get("/users/", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const userRepository = conn.getRepository(User);
    const results = await userRepository.findOne(req.user.id);
    return res.send(results);
});

router.put("/users/", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const userRepository = conn.getRepository(User);
    const user = await userRepository.findOne(req.user.id);
    userRepository.merge(user, req.body);
    const results = await userRepository.save(user);
    return res.send(results);
});

router.delete("/users/", async function (req: any, res: Response) {
    const conn = getConnection();
    const userRepository = conn.getRepository(User);
    const results = await userRepository.delete(req.user.id);
    return res.send(results);
});

router.put("/teams/", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const teamRepository = conn.getRepository(Team);
    const team = new Team();
    const userRepository = conn.getRepository(User);
    const user = await userRepository.findOne(req.user.id);
    if (req.body.name && user) {
        team.name = req.body.name;
        team.secret = crypto.randomBytes(20).toString('hex');
        team.owner = user;
        team.members = [user];
        teamRepository.save(team);
        return res.status(200).send("Team created");
    } else {
        return res.status(500).send("Invalid");
    }
});

router.get("/teams/", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const userRepository = conn.getRepository(User);
    let user;
    if (!req.body.secret) {
        user = await userRepository.findOne(req.user.id, { relations: ["teams"] });
        res.statusCode = 200;
        return res.send(user.teams);
    } else {
        const teamRepository = conn.getRepository(Team);
        const team = await teamRepository.findOne({ where: { secret: req.body.secret } });
        return res.status(200).send(team);
    }
});

router.delete("/teams/:id", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const teamRepository = conn.getRepository(Team);
    const team = await teamRepository.findOne(req.params.id, { relations: ["owner"] });
    if (team.owner.id == req.user.id) {
        teamRepository.delete(req.params.id);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.post("/teams/leave/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const teamRepository = conn.getRepository(Team);
    const team = await teamRepository.findOne({ where: { secret: req.params.secret }, relations: ["members"] });
    if (team) {
        const userRepository = conn.getRepository(User);
        const user = await userRepository.findOne(req.user.id);
        const index = team.members.findIndex((iter) => (iter.id == req.user.id));
        if (index > -1) {
            team.members.splice(index, 1);
        }
        teamRepository.save(team);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.post("/teams/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const teamRepository = conn.getRepository(Team);
    const team = await teamRepository.findOne({ where: { secret: req.params.secret }, relations: ["members"] });
    if (team) {
        const userRepository = conn.getRepository(User);
        const user = await userRepository.findOne(req.user.id);
        team.members.push(user);
        teamRepository.save(team);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.put("/channels/:teamSecret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const channelRepository = conn.getRepository(Channel);
    const channel = new Channel();
    const teamRepository = conn.getRepository(Team);
    const team = await teamRepository.findOne({ where: { secret: req.params.teamSecret }, relations: ["channels"] });
    const userRepository = conn.getRepository(User);
    const user = await userRepository.findOne(req.user.id);
    if (team && req.body.name && user) {
        channel.name = req.body.name;
        channel.secret = crypto.randomBytes(20).toString('hex');
        channel.members = [user];
        channel.teams = [team];
        channelRepository.save(channel);
        return res.status(200).send("Channel Created");
    } else {
        return res.status(500).send("Invalid");
    }
});

router.get("/channels/:teamSecret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const teamRepository = conn.getRepository(Team);
    const team = await teamRepository.findOne({ where: { secret: req.params.teamSecret }, relations: ["channels"] });
    if (team) {
        return res.status(200).send(team.channels);
    } else {
        return res.status(500).send("Invalid");
    }
});

router.delete("/channels/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const channelRepository = conn.getRepository(Channel);
    const channel = await channelRepository.findOne({ where: { secret: req.params.secret } });
    if (channel) {
        channelRepository.delete(channel);
        return res.sendStatus(200);
    }
    return res.sendStatus(500);
});

router.post("/channels/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const channelRepository = conn.getRepository(Channel);
    const channel = await channelRepository.findOne({ where: { secret: req.params.secret }, relations: ["members"] });
    if (channel) {
        const userRepository = conn.getRepository(User);
        const user = await userRepository.findOne(req.user.id);
        channel.members.push(user);
        channelRepository.save(channel);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.put("/messages/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const channelRepository = conn.getRepository(Channel);
    const channel = await channelRepository.findOne({ where: { secret: req.params.secret } });
    if (channel && req.body.text) {
        const userRepository = conn.getRepository(User);
        const user = await userRepository.findOne(req.user.id);
        const message = new Message();
        message.sender = user;
        message.channel = channel;
        message.is_vc = req.body.is_vc;
        message.text = req.body.text;
        message.timestamp = moment(Date.now() + 5.5 * 60 * 60 * 1000).toDate();
        const messageRepository = conn.getRepository(Message);
        messageRepository.save(message);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.get("/messages/:secret", jwt({ secret: secret, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    const conn = getConnection();
    const messageRepository = conn.getRepository(Message);
    const channelRepository = conn.getRepository(Channel);
    const channel = await channelRepository.findOne({ where: { secret: req.params.secret } });
    const messages = await messageRepository.find({ where: { channel: channel }, relations: ["sender"] });
    messages.forEach(element => {
        element.sender.email = ""
        element.sender.password = ""
    });
    res.status(200).send(JSON.stringify(messages));

});

export = router