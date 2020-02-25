(function () {
    'use strict';

    class gameData {
        constructor() {
            this.PlayModel = 0;
            gameData._instance = this;
            gameData.player = new PlayData();
        }
    }
    class PlayData {
        constructor() {
            this.avatarUrl = "";
            this.nickName = "";
            this.id = "";
            this.maxScore = 0;
            this.ifcanChallenge = false;
            this.c_avatarUrl = "";
            this.c_nickName = "";
            this.c_id = "";
            this.c_maxScore = 0;
        }
    }

    class Mouse extends Laya.Script {
        constructor() {
            super();
            this.mouse_type = 1;
            this.time_line = null;
            this.is_dead = false;
            this.mgr = null;
            this.hole_index = 0;
            this.mouse_type = 1;
        }
        showMouse(mgr, type = 1, index, timeSatge) {
            this.mgr = mgr;
            this.mouse_type = type;
            this.hole_index = index;
            var mouse = this.owner;
            mouse.skin = "res/mouse_normal_" + this.mouse_type + ".png";
            if (Laya.Browser.onMiniGame) {
                if (gameData._instance.PlayModel == 1) {
                    this.icon_Img.visible = true;
                    if (this.mouse_type == 1) {
                        this.icon_Img.skin = gameData.player.c_avatarUrl;
                    }
                    else {
                        this.icon_Img.skin = gameData.player.avatarUrl;
                    }
                }
                else {
                    this.icon_Img.visible = false;
                }
            }
            else {
                this.icon_Img.visible = false;
            }
            mouse.scaleX = 0;
            mouse.scaleY = 0;
            var time_line = Laya.TimeLine.to(mouse, {
                scaleX: 1,
                scaleY: 1
            }, 300);
            time_line.to(mouse, { scaleX: 0, scaleY: 0 }, 300, null, timeSatge * 100 * this.mouse_type);
            time_line.play(0, false);
            time_line.on(Laya.Event.COMPLETE, this, function () {
                mouse.removeSelf();
            });
            this.time_line = time_line;
        }
        onStart() {
        }
        hitedMouse() {
            if (this.time_line != null) {
                this.time_line.destroy();
                this.time_line = null;
            }
            var mouse = this.owner;
            mouse.skin = "res/mouse_hit_" + this.mouse_type + ".png";
            var time_line = Laya.TimeLine.to(mouse, { scaleX: 0, scaleY: 0 }, 300, null, 300);
            time_line.play(0, false);
            time_line.on(Laya.Event.COMPLETE, this, function () {
                mouse.removeSelf();
            });
        }
        onClick() {
            if (this.is_dead) {
                return;
            }
            this.is_dead = true;
            this.hitedMouse();
            this.mgr.mouseBeHited(this.mgr, this.mouse_type, this.hole_index);
        }
    }

    class Hammer extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
        }
        onDisable() {
        }
        onUpdate() {
        }
        showHammer() {
            var hammer = this.owner;
            var time = 100;
            hammer.rotation = 0;
            hammer.alpha = 1;
            var time_line = Laya.TimeLine.to(hammer, {
                rotation: 9
            }, time);
            time_line.to(hammer, {
                rotation: -9
            }, time * 1.5);
            time_line.to(hammer, {
                rotation: 0
            }, time);
            time_line.to(hammer, {
                alpha: 0
            }, 200, null, 200);
            time_line.play(0, false);
        }
        onStart() {
        }
    }

    class Score extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
        }
        onDisable() {
        }
        onUpdate() {
        }
        showScore(mgr, type = 1, index) {
            var score = this.owner;
            score.skin = "res/score_" + type + ".png";
            score.rotation = 0;
            score.alpha = 1;
            var time_line = Laya.TimeLine.to(score, {
                y: score.y - 15,
                alpha: 0
            }, 300, null, 200);
            time_line.play(0, false);
            time_line.on(Laya.Event.COMPLETE, this, function () {
                score.removeSelf();
                mgr.scoreCount(type);
            });
        }
        onStart() {
        }
    }

    class WXCloud {
        constructor() {
            this.needWait = true;
            this.needUpdatet = false;
            WXCloud._instance = this;
            if (Laya.Browser.onMiniGame) {
                Laya.Browser.window.wx.cloud.init({
                    env: 'lcy-xhwgt'
                });
                WXCloud.db = Laya.Browser.window.wx.cloud.database({
                    env: 'lcy-xhwgt'
                });
            }
        }
        Init(mgr) {
            this.mgr = mgr;
        }
        CreateCloudData() {
            WXCloud.db.collection('user').where({
                _openid: gameData.player.id,
            })
                .get().then(res => {
                if (res.data.length == 0) {
                    WXCloud.db.collection('user').add({
                        data: {
                            _id: gameData.player.id,
                            avatarUrl: gameData.player.avatarUrl,
                            nickName: gameData.player.nickName,
                        }
                    })
                        .then(res => {
                    });
                }
                else {
                    gameData.player.maxScore = res.data[0].score;
                }
            });
        }
        SelfCloudSave(id, content) {
            WXCloud.db.collection('user').doc(id).update({
                data: content,
                success: function (res) {
                    this.SuccessEvent(res);
                }.bind(this),
                fail: function (res) {
                    console.log("fail" + res);
                }.bind(this),
            });
        }
        UpdateChallengeData(id, needToHome = true) {
            if (id == gameData.player.id) {
                this.mgr.ShowGameTip();
                return;
            }
            WXCloud.db.collection('user').where({
                _openid: id,
            })
                .get().then(res => {
                if (res.data.length == 0) {
                }
                else {
                    if (id == gameData.player.id) {
                        this.mgr.ShowGameTip();
                        return;
                    }
                    gameData.player.ifcanChallenge = true;
                    gameData.player.c_id = id;
                    gameData.player.c_nickName = res.data[0].nickName;
                    gameData.player.c_avatarUrl = res.data[0].avatarUrl;
                    gameData.player.c_maxScore = res.data[0].score;
                    if (!this.needWait) {
                        if (needToHome) {
                            this.mgr.UpdateHomeChallenge();
                        }
                    }
                    else {
                        if (needToHome) {
                            this.needUpdatet = true;
                        }
                    }
                }
            });
        }
        SuccessEvent(res) {
        }
        FailEvent(res) {
        }
        CallFunction(funcName) {
            Laya.Browser.window.wx.cloud.callFunction({
                name: funcName,
                data: {
                    desc: "get UID"
                },
                success: function (res) {
                    this.Func_SuccessEvent(res.result);
                }.bind(this),
                fail: function (res) {
                    this.Func_FailEvent(res.result);
                }.bind(this),
            });
        }
        Func_SuccessEvent(res) {
            if (res.type == "getUID") {
                gameData.player.id = res.openid;
                this.needWait = false;
                this.CreateCloudData();
                if (this.needUpdatet) {
                    this.needUpdatet = false;
                    if (gameData.player.c_id == gameData.player.id) {
                        this.mgr.ShowGameTip();
                        gameData.player.ifcanChallenge = false;
                        gameData.player.c_id = "";
                        gameData.player.c_nickName = "";
                        gameData.player.c_avatarUrl = "";
                        gameData.player.c_maxScore = 0;
                    }
                    else {
                        this.mgr.UpdateHomeChallenge();
                    }
                }
            }
            else {
            }
        }
        Func_FailEvent(res) {
        }
    }

    class Share {
        constructor() {
            this.isChallenge = false;
            this.challengeId = "";
            Share._instance = this;
            if (Laya.Browser.onMiniGame) {
                Share.wx = Laya.Browser.window.wx;
                this.InitShare();
                this.onShow();
            }
        }
        InitShare() {
            if (Laya.Browser.onWeiXin) {
                console.log("初始化分享设置～");
                Share.wx.showShareMenu({
                    withShareTicket: true,
                    success: function (res) {
                        console.log("开启转发成功～");
                    },
                    fail: function (res) {
                        console.log("开启转发失败～");
                    },
                    complete: function (res) {
                    }
                });
                Share.wx.onShareAppMessage(function () {
                    return {
                        title: '打地鼠可好玩了,快来挑战我吧～',
                    };
                });
            }
        }
        doShare(nickName) {
            var str = `${nickName}向你发起挑战！`;
            console.log(str);
            if (Laya.Browser.onWeiXin) {
                const shareInfo = {
                    title: str,
                    query: `action=challenge&userId=${gameData.player.id}`
                };
                Share.wx.shareAppMessage(shareInfo);
            }
        }
        onShow() {
            if (Laya.Browser.onWeiXin) {
                Share.wx.onShow(res => {
                    let m_shareTicket = res.shareTicket;
                    let query = res.query;
                    if (query != null) {
                        if (query.action == "challenge") {
                            console.log(query.userId);
                            this.challengeId = query.userId;
                            if (WXCloud._instance.mgr != null) {
                                WXCloud._instance.UpdateChallengeData(this.challengeId);
                            }
                            else {
                                this.isChallenge = true;
                            }
                        }
                    }
                });
            }
        }
    }

    class over_mgr extends Laya.Script {
        constructor() {
            super();
            this.maxScore = 0;
        }
        ShowOver(mgr) {
            this.mgr = mgr;
            this.maxScore = this.mgr.score > gameData.player.maxScore ? this.mgr.score : gameData.player.maxScore;
            if (Laya.Browser.onMiniGame) {
                this.icon_Img.skin = gameData.player.avatarUrl;
                this.name_text.text = gameData.player.nickName;
                var data = {
                    avatarUrl: gameData.player.avatarUrl,
                    nickName: gameData.player.nickName,
                    score: this.maxScore,
                };
                WXCloud._instance.SelfCloudSave(gameData.player.id, data);
            }
            this.back_btn.on(Laya.Event.CLICK, this, this.OnClickBack);
            this.challenge_btn.on(Laya.Event.CLICK, this, this.onClickChallenge);
            this.UpdateOverUI();
        }
        UpdateOverUI() {
            this.all_score.text = this.mgr.score.toString();
            this.max_score.text = this.maxScore.toString();
            if (gameData._instance.PlayModel == 1) {
                this.m_icon_Img.skin = gameData.player.avatarUrl;
                this.m_name_text.text = gameData.player.nickName;
                this.m_score_text.text = this.mgr.score.toString();
                this.c_icon_Img.skin = gameData.player.c_avatarUrl;
                this.c_name_text.text = gameData.player.c_nickName;
                this.c_score_text.text = gameData.player.c_maxScore.toString();
                if (this.mgr.score > gameData.player.c_maxScore) {
                    this.challenge_Result.text = "胜";
                }
                else {
                    this.challenge_Result.text = "败";
                }
                this.challenge_Box.visible = true;
                this.icon_Img.visible = false;
            }
            else {
                this.challenge_Box.visible = false;
                this.icon_Img.visible = true;
            }
        }
        OnClickBack() {
            this.mgr.showWhichBack(1);
        }
        onClickChallenge() {
            Share._instance.doShare(gameData.player.nickName);
        }
    }

    class main_mgr extends Laya.Script {
        constructor() {
            super();
        }
        BeginGame() {
            if (gameData._instance.PlayModel == 0) {
                this.self_score_box.visible = true;
                this.self_icon.skin = gameData.player.avatarUrl;
                this.self_name.text = gameData.player.nickName;
                this.challenge_score_box.visible = false;
            }
            else {
                this.self_score_box.visible = true;
                this.self_icon.skin = gameData.player.avatarUrl;
                this.self_name.text = gameData.player.nickName;
                this.challenge_score_box.visible = true;
                this.challenge_icon.skin = gameData.player.c_avatarUrl;
                this.challenge_name.text = gameData.player.c_nickName;
                this.challenge_score.text = gameData.player.c_maxScore.toString();
            }
        }
    }

    class home_mgr extends Laya.Script {
        constructor() {
            super();
            this.start_btn = null;
            this.begin_btn = null;
            this.desc_Img = null;
            this.icon_Img = null;
            this.name_text = null;
            this.c_icon_Img = null;
            this.c_name_text = null;
            this.desc_shareTip = null;
            this.desc_challenge_btn = null;
            this.desc_back_btn = null;
            this.rate = 1;
        }
        onAwake() {
            this.c_icon_Img.visible = false;
        }
        Init(mgr) {
            this.mgr = mgr;
            this.desc_Img.visible = false;
            this.begin_btn.visible = false;
            this.start_btn.visible = false;
            this.challenge_btn.visible = false;
            this.icon_Img.visible = false;
            this.start_btn.on(Laya.Event.CLICK, this, this.OnClickStart);
            this.challenge_btn.on(Laya.Event.CLICK, this, this.OnClickChallenge);
            this.begin_btn.on(Laya.Event.CLICK, this, this.OnClickBegin);
            this.desc_challenge_btn.on(Laya.Event.CLICK, this, this.OnClickShareChallenge);
            this.desc_back_btn.on(Laya.Event.CLICK, this, this.OnClickback);
            if (Laya.Browser.onMiniGame) {
                this.rate = wx.getSystemInfoSync().windowWidth / 1080;
                Laya.Browser.window.wx.getUserInfo({
                    success: function (res) {
                        gameData.player.avatarUrl = res.userInfo.avatarUrl;
                        gameData.player.nickName = res.userInfo.nickName;
                        this.UpdatePlayerUI();
                        this.DefaultState();
                    }.bind(this),
                    fail: function (res) {
                        console.log(res);
                        this.ShowWXButton();
                    }.bind(this),
                });
                WXCloud._instance.CallFunction("getUID");
            }
            else {
                this.DefaultState();
            }
        }
        UpdateHomeChallenge() {
            this.c_icon_Img.skin = gameData.player.c_avatarUrl;
            this.c_name_text.text = gameData.player.c_nickName;
            if (this.wxbutton != null) {
                this.c_icon_Img.visible = true;
            }
            else {
                this.c_icon_Img.visible = true;
                this.DefaultState();
            }
        }
        ShowWXButton() {
            this.desc_Img.visible = false;
            this.begin_btn.visible = false;
            this.start_btn.visible = false;
            this.challenge_btn.visible = false;
            var width = (wx.getSystemInfoSync().windowWidth - 178) / 2;
            var height = wx.getSystemInfoSync().windowHeight * 0.7;
            this.wxbutton = Laya.Browser.window.wx.createUserInfoButton({
                type: 'image',
                image: "res/btn_souquan.png",
                style: {
                    left: width,
                    top: height,
                    width: 178,
                    height: 59,
                }
            });
            this.wxbutton.onTap((res) => {
                gameData.player.avatarUrl = res.userInfo.avatarUrl;
                gameData.player.nickName = res.userInfo.nickName;
                this.UpdatePlayerUI();
                if (gameData.player.ifcanChallenge) {
                    this.OnClickChallenge();
                }
                else {
                    this.OnClickStart();
                }
            });
        }
        UpdatePlayerUI() {
            if (Laya.Browser.onMiniGame) {
                this.icon_Img.skin = gameData.player.avatarUrl;
                this.name_text.text = gameData.player.nickName;
            }
        }
        DefaultState() {
            this.icon_Img.visible = true;
            this.desc_Img.visible = false;
            this.begin_btn.visible = false;
            this.start_btn.visible = true;
            this.challenge_btn.visible = true;
        }
        OnClickStart() {
            this.desc_self_ICON.skin = "res/mouse_normal_2.png";
            this.desc_C_ICON.skin = "res/mouse_normal_1.png";
            this.desc_Img.visible = true;
            this.begin_btn.visible = true;
            this.start_btn.visible = false;
            this.desc_shareTip.visible = false;
            this.challenge_btn.visible = false;
            gameData._instance.PlayModel = 0;
            if (this.wxbutton) {
                this.wxbutton.destroy();
            }
        }
        OnClickChallenge() {
            if (gameData.player.ifcanChallenge) {
                this.begin_btn.visible = true;
                this.desc_shareTip.visible = false;
                this.desc_self_ICON.skin = gameData.player.avatarUrl;
                this.desc_C_ICON.skin = gameData.player.c_avatarUrl;
                gameData._instance.PlayModel = 1;
            }
            else {
                this.begin_btn.visible = false;
                this.desc_shareTip.visible = true;
                this.desc_self_ICON.skin = "res/mouse_normal_2.png";
                this.desc_C_ICON.skin = "res/mouse_normal_1.png";
            }
            this.desc_Img.visible = true;
            this.start_btn.visible = false;
            this.challenge_btn.visible = false;
            if (this.wxbutton) {
                this.wxbutton.destroy();
            }
        }
        OnClickBegin() {
            if (gameData._instance.PlayModel == 1) {
                if (Laya.Browser.onMiniGame) {
                    WXCloud._instance.UpdateChallengeData(gameData.player.c_id, false);
                }
            }
            this.mgr.showWhichBack(2);
            this.DefaultState();
        }
        OnClickback() {
            this.DefaultState();
        }
        OnClickShareChallenge() {
            Share._instance.doShare(gameData.player.nickName);
        }
    }

    class game_mgr extends Laya.Script {
        constructor() {
            super();
            this.mouse_prefab = null;
            this.mouse_root = null;
            this.hammer = null;
            this.score_prefab = null;
            this.score_root = null;
            this.all_score = null;
            this.count_down = null;
            this.point_list = null;
            this.canvas = null;
            this.homeBack = null;
            this.overCanvas = null;
            this.init = false;
            this.score = 0;
            this.time = 0;
            this.roundTime = 30;
            new gameData();
            WXCloud._instance.Init(this);
        }
        onAwake() {
            if (!this.init) {
                this.over_Ctrl = this.overCanvas.getComponent(over_mgr);
                this.home_Ctrl = this.homeBack.getComponent(home_mgr);
                this.main_Ctrl = this.canvas.getComponent(main_mgr);
                this.home_Ctrl.Init(this);
                if (this.point_list) {
                    var count = this.point_list.numChildren;
                    gameData.pointArray = [];
                    for (var i = 0; i < count; i++) {
                        var item = this.point_list.getChildAt(i);
                        var point = { x: item.x, y: item.y + 80 };
                        gameData.pointArray.push(point);
                    }
                }
            }
        }
        ShowGameTip() {
            this.game_Tip.visible = true;
        }
        UpdateHomeChallenge() {
            this.home_Ctrl.UpdateHomeChallenge();
            this.showWhichBack(1);
        }
        createMouses() {
            var mouse = this.mouse_prefab.create();
            this.mouse_root.addChild(mouse);
            var hole_index = Math.random() * 9;
            hole_index = Math.floor(hole_index);
            mouse.x = gameData.pointArray[hole_index].x;
            mouse.y = gameData.pointArray[hole_index].y;
            var mouse_type = 1;
            var timeStage = 5;
            if (this.time > 60) {
                mouse_type = Math.random() < 0.11 ? 2 : 1;
                timeStage = 5;
            }
            else if (this.time > 30) {
                mouse_type = Math.random() < 0.41 ? 2 : 1;
                timeStage = 3;
            }
            else if (this.time > 1) {
                mouse_type = Math.random() < 0.21 ? 2 : 1;
                timeStage = 4;
            }
            mouse.getComponent(Mouse).showMouse(this, mouse_type, hole_index, timeStage);
            var time = (2 + Math.random() * 2) * timeStage * 100;
            time = Math.floor(time);
            Laya.timer.once(time, this, this.createMouses);
        }
        mouseBeHited(mgr, type, index) {
            var score = this.score_prefab.create();
            this.score_root.addChild(score);
            score.x = gameData.pointArray[index].x;
            score.y = gameData.pointArray[index].y - 300;
            score.getComponent(Score).showScore(mgr, type, index);
            this.hammer.x = gameData.pointArray[index].x + 170;
            this.hammer.y = gameData.pointArray[index].y - 100;
            this.hammer.getComponent(Hammer).showHammer();
        }
        showWhichBack(type = 1) {
            console.log(this.homeBack);
            switch (type) {
                case 1:
                    this.homeBack.visible = true;
                    this.canvas.visible = false;
                    this.overCanvas.visible = false;
                    break;
                case 2:
                    this.homeBack.visible = false;
                    this.canvas.visible = true;
                    this.overCanvas.visible = false;
                    this.BeginGame();
                    this.main_Ctrl.BeginGame();
                    break;
                case 3:
                    this.homeBack.visible = false;
                    this.canvas.visible = false;
                    this.overCanvas.visible = true;
                    this.over_Ctrl.ShowOver(this);
                    break;
                default:
                    this.homeBack.visible = true;
                    this.canvas.visible = false;
                    this.overCanvas.visible = false;
                    break;
            }
        }
        BeginGame() {
            this.time = this.roundTime;
            this.score = 0;
            this.count_down.text = this.time.toString();
            this.all_score.text = this.score.toString();
            this.createMouses();
            this.countDownEvent();
        }
        scoreCount(type) {
            this.score = (type == 1 ? this.score + 100 : this.score - 100);
            this.all_score.text = this.score.toString();
        }
        countDownEvent() {
            if (this.time >= 1) {
                Laya.timer.once(1000, this, function () {
                    this.time--;
                    this.count_down.text = this.time.toString();
                    this.countDownEvent();
                });
            }
            else {
                Laya.timer.clearAll(this);
                this.showWhichBack(3);
            }
        }
        onStart() {
            this.showWhichBack(1);
        }
    }

    class ClickHideSelf extends Laya.Script {
        constructor() {
            super();
        }
        onClick() {
            if (this.target != null) {
                this.target.visible = false;
            }
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/game_mgr.ts", game_mgr);
            reg("script/home_mgr.ts", home_mgr);
            reg("script/hammer.ts", Hammer);
            reg("script/score.ts", Score);
            reg("script/main_mgr.ts", main_mgr);
            reg("script/over_mgr.ts", over_mgr);
            reg("script/ClickHideSelf.ts", ClickHideSelf);
            reg("script/mouse.ts", Mouse);
        }
    }
    GameConfig.width = 1080;
    GameConfig.height = 1920;
    GameConfig.scaleMode = "fixedauto";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "main_scence.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            new WXCloud();
            new Share();
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
            if (Share._instance.isChallenge) {
                setTimeout(() => {
                    WXCloud._instance.UpdateChallengeData(Share._instance.challengeId);
                    Share._instance.isChallenge = false;
                }, 500);
            }
        }
    }
    new Main();

}());
