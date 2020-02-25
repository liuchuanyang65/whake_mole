import game_mgr from "./game_mgr";
import Label = Laya.Label;
import Image = Laya.Image;
import Button = Laya.Button;
import Box = Laya.Box;
import {gameData} from "./gameData";
import {WXCloud} from "./WXCloud";
import {Share} from "./Share";

export default class over_mgr extends Laya.Script {

     /** @prop {name:all_score, tips:"记录分数", type:Node, default:null}*/
     /** @prop {name:max_score, tips:"最高记录分数", type:Node, default:null}*/

     /** @prop {name:icon_Img, tips:"玩家icon", type:Node, default:null}*/
     /** @prop {name:name_text, tips:"玩家名", type:Node, default:null}*/

     /** @prop {name:back_btn, tips:"返回按钮", type:Node, default:null}*/
     /** @prop {name:challenge_btn, tips:"挑战按钮", type:Node, default:null}*/

     /** @prop {name:challenge_Box, tips:"挑战结算页面", type:Node, default:null}*/
     /** @prop {name:m_icon_Img, tips:"玩家icon", type:Node, default:null}*/
     /** @prop {name:m_name_text, tips:"玩家名", type:Node, default:null}*/
     /** @prop {name:m_score_text, tips:"玩家名", type:Node, default:null}*/

     /** @prop {name:c_icon_Img, tips:"玩家icon", type:Node, default:null}*/
     /** @prop {name:c_name_text, tips:"玩家名", type:Node, default:null}*/
     /** @prop {name:c_score_text, tips:"玩家名", type:Node, default:null}*/

     /** @prop {name:challenge_Result, tips:"挑战结果", type:Node, default:null}*/


     public all_score:Label;
     public max_score:Label;
     public icon_Img:Image;
     public name_text:Label;
     public back_btn:Button;
     public challenge_btn:Button;

     public challenge_Box:Box;
     public m_icon_Img:Image;
     public m_name_text:Label;
     public m_score_text:Label;

     public c_icon_Img:Image;
     public c_name_text:Label;
     public c_score_text:Label;

     public challenge_Result:Label;

    private maxScore:number = 0;

    private mgr:game_mgr;

    constructor() { 
        super();
    }

    public ShowOver(mgr:game_mgr):void
    {
        this.mgr = mgr;

        this.maxScore = this.mgr.score > gameData.player.maxScore? this.mgr.score: gameData.player.maxScore;

        if(Laya.Browser.onMiniGame)
        {
            this.icon_Img.skin =  gameData.player.avatarUrl;
            this.name_text.text = gameData.player.nickName;

            //上传成绩
            var data = {
                // _id:gameData.player.id,
                avatarUrl:gameData.player.avatarUrl,
                nickName:gameData.player.nickName,
                score:this.maxScore,
            }
            WXCloud._instance.SelfCloudSave(gameData.player.id,data);
        }

        this.back_btn.on(Laya.Event.CLICK,this,this.OnClickBack);
        this.challenge_btn.on(Laya.Event.CLICK,this,this.onClickChallenge);

        this.UpdateOverUI();
    }

    private UpdateOverUI()
    {
        this.all_score.text = this.mgr.score.toString();
        this.max_score.text = this.maxScore.toString();

        if(gameData._instance.PlayModel == 1)
        {
            //挑战模式结束
            this.m_icon_Img.skin = gameData.player.avatarUrl;
            this.m_name_text.text = gameData.player.nickName;
            this.m_score_text.text = this.mgr.score.toString();

            this.c_icon_Img.skin = gameData.player.c_avatarUrl;
            this.c_name_text.text = gameData.player.c_nickName;
            this.c_score_text.text = gameData.player.c_maxScore.toString();

            if(this.mgr.score > gameData.player.c_maxScore)
            {
                this.challenge_Result.text = "胜";
            }
            else
            {
                this.challenge_Result.text = "败";
            }


            this.challenge_Box.visible = true;

            this.icon_Img.visible = false;

            
        }
        else
        {
            //正常模式结束
            this.challenge_Box.visible = false;

            this.icon_Img.visible = true;
        }


    }

    //点击返回主页面
    private OnClickBack()
    {
        this.mgr.showWhichBack(1);
    }


    public onClickChallenge(){
        Share._instance.doShare(gameData.player.nickName);
    }
}