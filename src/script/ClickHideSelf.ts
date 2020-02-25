import Timeline = Laya.TimeLine;
import Box = Laya.Box;

export default class ClickHideSelf extends Laya.Script{

    /** @prop {name:target,tips:"关闭对象",type:Node}*/

    private target:Box;

    constructor() {
        super();
    }

    onClick()
    {
        if(this.target != null)
        {
            this.target.visible = false;
        }
    }
}