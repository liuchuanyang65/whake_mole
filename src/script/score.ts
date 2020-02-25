// import gameMgr from './game_mgr';
// 控制分数展示显示
export default class Score extends Laya.Script {
    
    constructor() {
        super(); 
    }
    
    onEnable(): void {
    }

    onDisable(): void {
    }

    onUpdate(): void {
    }
    
    showScore(mgr, type: number=1, index): void{
        // 锤子扬起落下 0 -> 9 -> -9 -> 0
        var score = this.owner as Laya.Image
        score.skin = "res/score_" + type + ".png"
        // 设置初始值
        score.rotation = 0
        score.alpha = 1 // 显示

        // 设置动画
        var time_line= Laya.TimeLine.to(score, {
            y: score.y - 15,
            alpha: 0
        }, 300, null, 200)
        time_line.play(0, false)
        // 删除当前预制体的分数
        time_line.on(Laya.Event.COMPLETE, this, function() {
            score.removeSelf()
            mgr.scoreCount(type)
            // gameMgr.instance.scoreCount(type)
        })
    }

    onStart(): void {
    }
}