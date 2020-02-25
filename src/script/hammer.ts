export default class Hammer extends Laya.Script {
    
    constructor() {
        super(); 
    }
    
    onEnable(): void {
    }

    onDisable(): void {
    }

    onUpdate(): void {
    }
    
    showHammer(): void{
        // 锤子扬起落下 0 -> 9 -> -9 -> 0
        var hammer = this.owner as Laya.Sprite
        var time =100
        // 设置初始值
        hammer.rotation = 0
        hammer.alpha = 1 // 显示

        // 设置动画
        var time_line= Laya.TimeLine.to(hammer, {
            rotation: 9
        }, time)
        time_line.to(hammer, {
            rotation: -9
        }, time * 1.5) // 9 -> 0 0 -> -9
        time_line.to(hammer, {
            rotation: 0
        }, time)
        time_line.to(hammer, {
            alpha: 0
        }, 200, null, 200) // 打完消失
        time_line.play(0, false)
    }
    onStart(): void {
        // this.showHammer()
    }
}