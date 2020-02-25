import game_mgr from "./game_mgr";
import Label = Laya.Label;
import Image = Laya.Image;
import Button = Laya.Button;
import Box = Laya.Box;
import {gameData} from "./gameData";
import {WXCloud} from "./WXCloud";
import {Share} from "./Share";

export default class main_mgr extends Laya.Script {

    /** @prop {name:self_score_box, tips:"记录分数Box", type:Node, default:null}*/
    /** @prop {name:self_icon, tips:"自己头像", type:Node, default:null}*/
    /** @prop {name:self_name, tips:"自己名字", type:Node, default:null}*/

    /** @prop {name:challenge_score_box, tips:"挑战者分数记录分数Box", type:Node, default:null}*/
    /** @prop {name:challenge_icon, tips:"挑战者头像", type:Node, default:null}*/
    /** @prop {name:challenge_name, tips:"挑战者名字", type:Node, default:null}*/

    /** @prop {name:challenge_score, tips:"挑战者分数", type:Node, default:null}*/

    public self_score_box:Box;
    public self_icon:Image;
    public self_name:Label;

    public challenge_score_box:Box;
    public challenge_icon:Image;
    public challenge_name:Label;

    public challenge_score:Label;

    constructor() { 
        super();
    }

    public BeginGame()
    {
        if(gameData._instance.PlayModel == 0)
        {
            //单人模式
            this.self_score_box.visible = true;
            this.self_icon.skin = gameData.player.avatarUrl;
            this.self_name.text =  gameData.player.nickName;

            this.challenge_score_box.visible = false;
        }
        else
        {
            //挑战模式
            this.self_score_box.visible = true;
            this.self_icon.skin = gameData.player.avatarUrl;
            this.self_name.text =  gameData.player.nickName;

            this.challenge_score_box.visible = true;
            this.challenge_icon.skin = gameData.player.c_avatarUrl;
            this.challenge_name.text =  gameData.player.c_nickName;
            this.challenge_score.text =  gameData.player.c_maxScore.toString();

        }
    }

}