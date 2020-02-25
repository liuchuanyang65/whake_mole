
export class gameData{

    public static _instance:gameData;

    public static pointArray:Array<{x:number,y:number}>;

    public static player:PlayData;

    public PlayModel:number = 0;    //0：正常模式，1：挑战模式

    constructor() {
        gameData._instance = this;
        gameData.player = new PlayData();
    }
}

export class PlayData{
    public avatarUrl:string =""; 
    public nickName:string =""; 
    public id:string = "";
    public maxScore:number = 0;

    public ifcanChallenge = false;

    public c_avatarUrl:string =""; 
    public c_nickName:string =""; 
    public c_id:string = "";
    public c_maxScore:number = 0;

    constructor() {
    }
}