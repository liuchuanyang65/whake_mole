import Prefab = Laya.Prefab;
import Node = Laya.Node;
import Label = Laya.Label;
import Box = Laya.Box;
// 调用mouse
import mouseC from "./mouse";
import hammerC from "./hammer";
import scoreC from "./score";
import {gameData, PlayData} from "./gameData";
import over_mgr from "./over_mgr";
import main_mgr from "./main_mgr";
import home_mgr from "./home_mgr";
import {Share} from "./Share";
import { WXCloud } from "./WXCloud";

export default class game_mgr extends Laya.Script {
    /** @prop {name:mouse_prefab, tips:“老鼠预制体”, type:Prefab, default:null}*/
    public mouse_prefab:Prefab = null;
    /** @prop {name:mouse_root, tips:“老鼠父亲节点”, type:Node, default:null}*/
    public mouse_root:Node = null;

    /** @prop {name:hammer, tips:“锤子”, type:Node, default:null}*/
    public hammer:Laya.Image = null;

    /** @prop {name:score_prefab, tips:“分数预制体”, type:Prefab, default:null}*/
    public score_prefab:Prefab = null;
    /** @prop {name:score_root, tips:“分数父亲节点”, type:Node, default:null}*/
    public score_root:Node = null;
    /** @prop {name:all_score, tips:“记录分数”, type:Node, default:null}*/
    public all_score:Label = null;

    /** @prop {name:count_down, tips:“倒计时”, type:Node, default:null}*/
    public count_down:Label = null;

    /** @prop {name:point_list, tips:“坐标点”, type:Node}*/
    public point_list:Box = null;


    /** @prop {name:canvas, tips:“主画幕”, type:Node, default:null}*/
    public canvas:Laya.Sprite = null;
    /** @prop {name:homeBack, tips:“首页画幕”, type:Node, default:null}*/
    public homeBack:Laya.Box = null;

    /** @prop {name:overCanvas, tips:“结算画幕”, type:Node, default:null}*/
    public overCanvas:Box = null;

    /** @prop {name:game_Tip,tips:"提示对象",type:Node}*/
    public game_Tip:Box;


    private init:boolean = false;
    private over_Ctrl:over_mgr;
    private home_Ctrl:home_mgr;
    private main_Ctrl:main_mgr;

    public score:number = 0;    //玩家分数
    public time:number = 0;    //玩家倒计时
    private roundTime:number = 30;  //单句时长

    constructor() { 
        super();
        new gameData();
        WXCloud._instance.Init(this);
    }
    
    onAwake(): void {
        if(!this.init)
        {
            this.over_Ctrl = this.overCanvas.getComponent(over_mgr) as over_mgr;
            this.home_Ctrl = this.homeBack.getComponent(home_mgr) as home_mgr;
            this.main_Ctrl = this.canvas.getComponent(main_mgr) as main_mgr;

            this.home_Ctrl.Init(this);

            //初始化坐标点数据
            if(this.point_list)
            {
                var count = this.point_list.numChildren;
                gameData.pointArray = [];
                //遍历所有的坐标组件，获取老鼠应该生成的位置
                for(var i = 0; i<count; i++)
                {
                    var item = this.point_list.getChildAt(i) as Box;
                    var point = {x:item.x,y:item.y + 80};
                    gameData.pointArray.push(point);
                }

            }
        }
    }

    //对于点击自己的挑战链接进来的玩家进行提示
    public ShowGameTip()
    {
        this.game_Tip.visible = true;
    }

    //获取到挑战者信息后在主页面显示
    public UpdateHomeChallenge():void{
        this.home_Ctrl.UpdateHomeChallenge();

        this.showWhichBack(1);
    }

    createMouses(): void {
        // 创建老鼠预制体
        var mouse:Laya.Image = this.mouse_prefab.create()
        this.mouse_root.addChild(mouse)

        // 从那个洞口出来
        // [0,9)
        var hole_index = Math.random() * 9;
        hole_index = Math.floor(hole_index);
        
        // 设置老鼠 锤子位置
        // mouse.x = hole_config.mouse_pos[hole_index].x
        // mouse.y = hole_config.mouse_pos[hole_index].y
        mouse.x = gameData.pointArray[hole_index].x
        mouse.y = gameData.pointArray[hole_index].y
        
        // 根据时间设置阶段
        var mouse_type = 1
        var timeStage = 5 // 根据时间记录阶段
        if (this.time > 60) {
            mouse_type = Math.random() < 0.11 ? 2 : 1 // 2 好老鼠减分 1 坏老鼠加分
            timeStage = 5
        } else if (this.time > 30){
            mouse_type = Math.random() < 0.41 ? 2 : 1
            timeStage = 3
        } else if (this.time > 1){
            mouse_type = Math.random() < 0.21 ? 2 : 1
            timeStage = 4
        }
        // 老鼠类型随机生成
        // var mouse_type = Math.random() < 0.7 ? 3 : (Math.random() < 0.35 ? 2 : 3)
        // var mouse_type = Math.random() < 0.3 ? 1: 2
        // 调mouse组件方法生成mouse
        mouse.getComponent(mouseC).showMouse(this, mouse_type, hole_index, timeStage)

        // 隔一段时间生成一个老鼠
        var time = (2 + Math.random() * 2) * timeStage * 100  // 2-4秒生成一个小老鼠
        time = Math.floor(time)
        Laya.timer.once(time, this, this.createMouses)
    }

    mouseBeHited(mgr, type, index): void {
        // 根据类型来判断加减分
        var score:Laya.Image = this.score_prefab.create()
        this.score_root.addChild(score)
        score.x = gameData.pointArray[index].x
        score.y = gameData.pointArray[index].y -300
        score.getComponent(scoreC).showScore(mgr, type, index)
        // 调整锤子的位置
        // 设置老鼠 锤子位置
        this.hammer.x = gameData.pointArray[index].x + 170
        this.hammer.y = gameData.pointArray[index].y - 100
        // 播放锤子动画
        this.hammer.getComponent(hammerC).showHammer()
    }

    // 显示哪种状态背景1：homeBachk 背景2： canvas开始游戏
    public showWhichBack (type:Number = 1) {
        console.log(this.homeBack)
        switch(type)
        {
            case  1 :
                this.homeBack.visible = true;
                this.canvas.visible = false;
                this.overCanvas.visible = false;

                break;
            case 2 :
                this.homeBack.visible = false
                this.canvas.visible = true
                this.overCanvas.visible = false;

                this.BeginGame();
                this.main_Ctrl .BeginGame();
                break;
            case  3 :
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

    private BeginGame()
    {
        this.time = this.roundTime;
        this.score= 0;
        this.count_down.text = this.time.toString();
        this.all_score.text = this.score.toString();
        this.createMouses()
        this.countDownEvent()
    }

    // 计算分数
    scoreCount (type):void {
        this.score = (type == 1 ? this.score + 100 :this.score - 100);

        this.all_score.text = this.score.toString();
    }

    // 倒计时
    countDownEvent (): void {
        if (this.time >= 1) {
            Laya.timer.once(1000, this, function () {
                this.time--;
                this.count_down.text = this.time.toString();
                this.countDownEvent()
            })
        } else {
            Laya.timer.clearAll(this)
            this.showWhichBack(3)
        }
    }

    onStart(): void {
        //调用DebugPanel调试面板
        // Laya.enableDebugPanel()
        this.showWhichBack(1)
    }
}