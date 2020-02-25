import gameMgr from './game_mgr';
import Button = Laya.Button;
import Image = Laya.Image;
import Box = Laya.Box;
import Label = Laya.Label;
import {gameData} from "./gameData";
import {WXCloud} from "./WXCloud";
import { Share } from './Share';

export default class home_mgr extends Laya.Script {
    
    /** @prop {name:start_btn, tips:"开始按钮", type:Node, default:null}*/
    /** @prop {name:begin_btn, tips:"开始游戏按钮", type:Node, default:null}*/
    /** @prop {name:desc_Img, tips:"说明页面", type:Node, default:null}*/

    /** @prop {name:challenge_btn, tips:"挑战按钮", type:Node, default:null}*/

    /** @prop {name:icon_Img, tips:"玩家icon", type:Node, default:null}*/
    /** @prop {name:name_text, tips:"玩家名", type:Node, default:null}*/

    /** @prop {name:c_icon_Img, tips:"玩家icon", type:Node, default:null}*/
    /** @prop {name:c_name_text, tips:"玩家名", type:Node, default:null}*/

    /** @prop {name:desc_shareTip, tips:"说明页面_发起挑战", type:Node, default:null}*/
    /** @prop {name:desc_challenge_btn, tips:"说明页面_发起挑战", type:Node, default:null}*/

    /** @prop {name:desc_self_ICON, tips:"-100icon", type:Node, default:null}*/
    /** @prop {name:desc_C_ICON, tips:"+100Icon", type:Node, default:null}*/

    /** @prop {name:desc_back_btn, tips:"说明页面_返回", type:Node, default:null}*/
    

    public start_btn:Button = null;
    public begin_btn:Button = null;
    public challenge_btn:Button;
    public desc_Img:Image = null;

    public icon_Img:Image = null;
    public name_text:Label = null;

    public c_icon_Img:Image = null;
    public c_name_text:Label = null;

    public desc_self_ICON:Image;
    public desc_C_ICON:Image;

    public desc_shareTip:Box = null;
    public desc_challenge_btn:Button = null;

    public desc_back_btn:Button = null;

    private mgr:gameMgr;

    private wxbutton:any;

    private rate:number = 1;

    constructor() {
        super(); 
    }

    onAwake(): void {
        this.c_icon_Img.visible = false;
    }

    //初始化
    Init(mgr:gameMgr): void {
        this.mgr = mgr;

        this.desc_Img.visible = false;
        this.begin_btn.visible = false;
        this.start_btn.visible = false;
        this.challenge_btn.visible = false;
        this.icon_Img.visible = false;
        
        this.start_btn.on(Laya.Event.CLICK,this,this.OnClickStart);
        this.challenge_btn.on(Laya.Event.CLICK,this,this.OnClickChallenge);

        this.begin_btn.on(Laya.Event.CLICK,this,this.OnClickBegin);

        this.desc_challenge_btn.on(Laya.Event.CLICK,this,this.OnClickShareChallenge);

        this.desc_back_btn.on(Laya.Event.CLICK,this,this.OnClickback);

        if(Laya.Browser.onMiniGame){
            this.rate = wx.getSystemInfoSync().windowWidth/1080;
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            Laya.Browser.window.wx.getUserInfo({
                success: 
                    function(res) {
                        gameData.player.avatarUrl = res.userInfo.avatarUrl;
                        gameData.player.nickName = res.userInfo.nickName;

                        this.UpdatePlayerUI();

                        this.DefaultState();
                    }.bind(this),
                fail: 
                    function(res) {
                        console.log(res)
                        this.ShowWXButton();
                    }.bind(this),
                });

            WXCloud._instance.CallFunction("getUID");
        }
        else
        {
            this.DefaultState();
        }
    }

    public UpdateHomeChallenge():void{
        
        this.c_icon_Img.skin = gameData.player.c_avatarUrl;
        this.c_name_text.text = gameData.player.c_nickName;

        if(this.wxbutton != null)
        {
            this.c_icon_Img.visible = true;
        }
        else
        {
            this.c_icon_Img.visible = true;
            this.DefaultState();
        }

    }

    private ShowWXButton():void
    {
        this.desc_Img.visible = false;
        this.begin_btn.visible = false;
        this.start_btn.visible = false;
        this.challenge_btn.visible = false;

        var width = (wx.getSystemInfoSync().windowWidth-178) / 2;
        var height = wx.getSystemInfoSync().windowHeight * 0.7;
        this.wxbutton = Laya.Browser.window.wx.createUserInfoButton({
                        type: 'image',
                        image:"res/btn_souquan.png",
                        style: {
                        left:width,
                        top: height,
                        width: 178,
                        height: 59,
                        }
                    });
        this.wxbutton.onTap((res) => {
                        // 此处可以获取到用户信息
                        gameData.player.avatarUrl = res.userInfo.avatarUrl;
                        gameData.player.nickName = res.userInfo.nickName;
                        
                        this.UpdatePlayerUI();
                        
                        //判断玩家是通过链接点进来的
                        if(gameData.player.ifcanChallenge)
                        {
                            this.OnClickChallenge();
                        }
                        else
                        {
                            this.OnClickStart();
                        }
                    })
    }

    //显示玩家头像和昵称信息
    public UpdatePlayerUI()
    {
        if(Laya.Browser.onMiniGame)
        {
            this.icon_Img.skin =  gameData.player.avatarUrl;
            this.name_text.text = gameData.player.nickName;
        }
    }

    //默认状态
    public DefaultState()
    {
        this.icon_Img.visible = true;
        this.desc_Img.visible = false;
        this.begin_btn.visible = false;
        this.start_btn.visible = true;
        this.challenge_btn.visible = true;
    }

    // 开始游戏
    OnClickStart(): void {

        this.desc_self_ICON.skin = "res/mouse_normal_2.png";
        this.desc_C_ICON.skin = "res/mouse_normal_1.png";

        this.desc_Img.visible = true;
        this.begin_btn.visible = true;
        this.start_btn.visible = false;

        this.desc_shareTip.visible = false;
        this.challenge_btn.visible = false;

        gameData._instance.PlayModel =0;

        if(this.wxbutton)
        {
            this.wxbutton.destroy();
        }
    }

    // 开始挑战
    OnClickChallenge(): void {
        if(gameData.player.ifcanChallenge)
        {
            this.begin_btn.visible = true;
            this.desc_shareTip.visible = false;

            this.desc_self_ICON.skin = gameData.player.avatarUrl;
            this.desc_C_ICON.skin = gameData.player.c_avatarUrl;

            gameData._instance.PlayModel = 1;
        }
        else
        {
            this.begin_btn.visible = false;
            this.desc_shareTip.visible = true;

            this.desc_self_ICON.skin = "res/mouse_normal_2.png";
            this.desc_C_ICON.skin = "res/mouse_normal_1.png";
        }
        this.desc_Img.visible = true;
        this.start_btn.visible = false;
        this.challenge_btn.visible = false;
            
    
        if(this.wxbutton)
        {
            this.wxbutton.destroy();
        }
    }

    // 开始游戏
    OnClickBegin(): void {
        if(gameData._instance.PlayModel == 1)
        {
            if(Laya.Browser.onMiniGame){
                WXCloud._instance.UpdateChallengeData(gameData.player.c_id,false);
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