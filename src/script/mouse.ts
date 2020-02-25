import hammer from "./hammer";
import Image = Laya.Image;
import { gameData } from "./gameData";

export default class Mouse extends Laya.Script {
    /** @prop {name:mouse_type, tips:"老鼠类型", type:Int, default:1}*/
    /** @prop {name:icon_Img, tips:"玩家icon", type:Node, default:null}*/

    public icon_Img:Image;

    public mouse_type:number = 1; // 老鼠类型
    public time_line = null; // 用来判断当前老鼠状态
    public is_dead = false; // 预防多次点击
    public mgr = null; //主轴代码
    public hole_index = 0; // 记录老鼠出现的洞
    
    constructor() {
        super(); 
        // 先跑构造函数后跑UI面板上设置的值
        this.mouse_type = 1 // 设置默认值
    }
    
    
    showMouse(mgr, type: number=1, index, timeSatge): void{
        this.mgr = mgr;
        this.mouse_type = type;
        this.hole_index = index; // 当前是哪个洞出了老鼠
  
        var mouse = this.owner as Laya.Image;
        mouse.skin = "res/mouse_normal_" + this.mouse_type + ".png"

        if(Laya.Browser.onMiniGame){
            if(gameData._instance.PlayModel == 1)
            {
                this.icon_Img.visible = true;

                //1坏老鼠，2好老鼠
                if(this.mouse_type == 1)
                {
                    this.icon_Img.skin = gameData.player.c_avatarUrl;
                }
                else
                {
                    this.icon_Img.skin = gameData.player.avatarUrl;
                }
            }
            else
            {
                this.icon_Img.visible = false;
            }
        }
        else
        {
            this.icon_Img.visible = false;
            // this.icon_Img.visible = true;
            // this.icon_Img.skin = "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKlbh0Do6dgp7wEe74jzFEINpTibAmDibWrUvf8F1J6NpgA2Kr0OVeBFWyCYZickCrDTF9fz1iaIB3Log/132";
        }

        // 老鼠出动啦
        mouse.scaleX = 0
        mouse.scaleY = 0

        // TimeLine 
        var time_line= Laya.TimeLine.to(mouse, {
            scaleX: 1,
            scaleY: 1
        }, 300)
        // 缩回去
        time_line.to(mouse, {scaleX: 0, scaleY: 0}, 300, null, timeSatge*100*this.mouse_type)
        time_line.play(0, false)
        // 删除当前预制体的老鼠
        time_line.on(Laya.Event.COMPLETE, this, function() {
            mouse.removeSelf()
        })
        
        // 将当前的time_line赋值给全局的time_line
        this.time_line = time_line
    }

    onStart(): void {
        // this.showMouse(this.mouse_type)
    }

    // 被打击的小老鼠
    hitedMouse (): void {
        if (this.time_line != null) {
            // 有动画正在进行中
            this.time_line.destroy()
            this.time_line = null
        }
        // 并改变被打后状态图
        var mouse = this.owner as Laya.Image;
        mouse.skin = "res/mouse_hit_" + this.mouse_type + ".png"
        var time_line= Laya.TimeLine.to(mouse, {scaleX: 0, scaleY: 0}, 300, null, 300)
        time_line.play(0, false)
        // 删除当前预制体的老鼠
        time_line.on(Laya.Event.COMPLETE, this, function() {
            mouse.removeSelf()
        })
    }

    // 打击老鼠显示锤子关闭正在进行的动画
    onClick(): void {
        if (this.is_dead) {
            return;
        }
        // 预防多次点击
        this.is_dead = true
        this.hitedMouse()

        // 继续调用主轴程序上的老鼠点击事件
        this.mgr.mouseBeHited(this.mgr, this.mouse_type, this.hole_index)
    }
}