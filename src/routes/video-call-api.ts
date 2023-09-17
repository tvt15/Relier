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

router.post("/create", jwt({ secret: SECRET, algorithms: ['HS256'] }), async function (req: any, res: Response) {
    var data = { "mediaMode": "ROUTED", "recordingMode": "MANUAL", "forcedVideoCodec": "VP8", "defaultRecordingProperties": { "name": "MyRecording", "hasAudio": true, "hasVideo": true, "outputMode": "COMPOSED", "recordingLayout": "BEST_FIT", "resolution": "1280x720", "frameRate": 25, "shmSize": 536870912 } };
    console.log(req.body.customSessionId);
    if (req.body.customSessionId) {
        data["customSessionId"] = req.body.customSessionId;
    }
    axios({
        method: 'post',
        url: `${OPENVIDU_URL}/sessions`,
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then(function (response) {
            res.status(200).send({ "session_id": response.data.id });
        })
        .catch(function (error) {
            if(error.response.status===409)
                res.status(200).send({ "session_id": req.body.customSessionId });
            console.log(error);
        });
});

export = router