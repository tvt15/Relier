import * as express from "express";
import * as jwt from "express-jwt";
import axios from "axios";
import { Request, Response } from "express";
const data = require('../../projectconfig.json');
let router = express.Router();
const SECRET = data["jwt-secret"];
const OPENVIDU_URL = data["openvidu-url"] + "/openvidu/api";
const OPENVIDU_SECRET = data["openvidu-secret"];
const AUTH_HEADER = 'Basic ' + (Buffer.from('OPENVIDUAPP:' + OPENVIDU_SECRET).toString('base64'));

router.post("/:sid", jwt({ secret: SECRET, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    var data = JSON.stringify({ "type": "WEBRTC", "data": req.user.name, "record": true, "role": "PUBLISHER", "kurentoOptions": { "videoMaxRecvBandwidth": 1000, "videoMinRecvBandwidth": 300, "videoMaxSendBandwidth": 1000, "videoMinSendBandwidth": 300, "allowedFilters": ["GStreamerFilter", "ZBarFilter"] } });

    axios({
        method: 'post',
        url: `${OPENVIDU_URL}/sessions/${req.params.sid}/connection`,
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json',
        },
        data: data
    })
        .then(function (response) {
            res.status(200).send({ "token": response.data.token });
        })
        .catch(function (error) {
            res.status(500).send();
        });

});

export = router