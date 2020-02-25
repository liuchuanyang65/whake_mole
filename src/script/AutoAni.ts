import Timeline = Laya.TimeLine;
import Button = Laya.Button;

export default class AutoAni extends Laya.Script{

     /** @prop {name:isAuto,tips:"是否自动播放",type:Bool}*/
 
    private isAuto:boolean; 
    private ani:Timeline;

    private self:Button;

    constructor() {
        super();
    }

    onStart()
    {
        this.self = this.owner as Button;

        this.ani = Timeline.to(this.self,{scaleX:1.1,scaleY:1.1},600);

        this.ani.to(this.self,{scaleX:1,scaleY:1},600);
        this.ani.to(this.self,{scaleX:0.9,scaleY:0.9},600);
        this.ani.to(this.self,{scaleX:1,scaleY:1},600);

        if(this.ani != null)
        {
            if(this.isAuto)
            {
                this.ani.play(0,true);
            }
        }
    }

}