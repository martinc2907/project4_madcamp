import express from 'express';
import Account from '../models/account';

const router = express.Router();

router.post('/signup', (req, res) => {
    let usernameRegex = /^[a-z0-9]+$/;

    if( !usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "Bad username!",
            code: 1
        });
    }

    if(req.body.password.length <4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "Bad password!",
            code:2
        });
    }

    Account.findOne({ username: req.body.username }, (err, exists) => {
        if(err) throw err;
        if(exists) {
            return res.status(409).json({
                error: "USERNAME ALREADY EXISTS",
                code: 3
            });
        }

        let account = new Account({
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        account.save(err => {
            if(err) throw err;
            return res.json({ success: true });
        });
    });

});

router.post('/signin', (req, res) => {

    if(typeof req.body.password !== "string") {
        return res.status(401).json({
            error: "LOGIN FAILED",
            code: 1
        });
    }

    // FIND THE USER BY USERNAME
    Account.findOne({ username: req.body.username}, (err, account) => {
        if(err) throw err;

        // CHECK ACCOUNT EXISTANCY
        if(!account) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // CHECK WHETHER THE PASSWORD IS VALID
        if(!account.validateHash(req.body.password)) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // ALTER SESSION
        let session = req.session;
        session.loginInfo = {
            _id: account._id,
            username: account.username
        };

        // RETURN SUCCESS
        return res.json({
            success: true
        });
    });
});

router.get('/getinfo', (req, res) => {
    if(typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }

    res.json({ info: req.session.loginInfo });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => { if(err) throw err; });
    return res.json({ sucess: true });
});

router.get('/search/:username', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var re = new RegExp('^' + req.params.username);
    Account.find({username: {$regex: re}}, {_id: false, username: true})
    .limit(5)
    .sort({username: 1})
    .exec((err, accounts) => {
        if(err) throw err;
        res.json(accounts);
    });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', (req, res) => {
    res.json([]);
});

export default router;
