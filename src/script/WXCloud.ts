import {gameData} from "./gameData";
import gameMgr from './game_mgr';

export class WXCloud{

    public static _instance:WXCloud;
    public static db:any;

    public mgr:gameMgr;

    private needWait:boolean = true;
    private needUpdatet:boolean = false;

    constructor() {
        WXCloud._instance = this;

        if(Laya.Browser.onMiniGame){
          Laya.Browser.window.wx.cloud.init({
            env: 'lcy-xhwgt'
        })
        
        WXCloud.db = Laya.Browser.window.wx.cloud.database({
            env: 'lcy-xhwgt'
        });
        }
    }

    //初始化
    Init(mgr:gameMgr): void {
      this.mgr = mgr;
    }

    //在云数据库创建新用户数据存储块
    public CreateCloudData()
    {
        WXCloud.db.collection('user').where({
          _openid: gameData.player.id,
        })
        .get().then(res => {
          // res.data 包含该记录的数据
          // console.log(res.data.length);

          if(res.data.length == 0)
          {
            WXCloud.db.collection('user').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                _id:gameData.player.id,
                avatarUrl:gameData.player.avatarUrl,
                nickName:gameData.player.nickName,
              }
            })
            .then(res => {
              // console.log(res)
            })
          }
          else
          {
            gameData.player.maxScore = res.data[0].score;
          }
        })
    }

    // 更新玩家数据
    public SelfCloudSave(id:string,content:any)
    {
        WXCloud.db.collection('user').doc(id).update({
            // data 字段表示需新增的 JSON 数据
            data:content,
            success: function(res) {
              // console.log(res)
              this.SuccessEvent(res);
            }.bind(this),

            fail: function(res) {
              console.log("fail" + res);
              //  this.FailEvent(res);
            }.bind(this),
          })
    }

    //更新挑战者信息
    public UpdateChallengeData(id:string,needToHome:boolean = true)
    {
        if(id == gameData.player.id)
        {
          this.mgr.ShowGameTip();
          return;
        }

        WXCloud.db.collection('user').where({
          _openid: id,
        })
        .get().then(res => {
          // res.data 包含该记录的数据

          if(res.data.length == 0)
          {
            //什么都不用做
          }
          else
          {
            //数据查询会有延时，在获取到数据后再做一次判断
            if(id == gameData.player.id)
            {
              this.mgr.ShowGameTip();
              return;
            }

            gameData.player.ifcanChallenge = true;
            gameData.player.c_id = id;
            gameData.player.c_nickName = res.data[0].nickName;
            gameData.player.c_avatarUrl = res.data[0].avatarUrl;
            gameData.player.c_maxScore = res.data[0].score;

            if(!this.needWait)
            {
              if(needToHome)
              {
                this.mgr.UpdateHomeChallenge();
              }
            }
            else
            {
              if(needToHome)
              {
                this.needUpdatet = true;
              }
            }
          }
        })
    }

    private SuccessEvent(res:any)
    {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        // console.log(res)
    }

    private FailEvent(res:any)
    {
         // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        //  console.log(res)
    }

    public CallFunction(funcName:string)
    {
        Laya.Browser.window.wx.cloud.callFunction({
            // 云函数名称
            name: funcName,
            // 传给云函数的参数
            data: {
              desc:"get UID"
            },
            success: function(res) {
              this.Func_SuccessEvent(res.result);
            }.bind(this),

            fail: function(res) {
               this.Func_FailEvent(res.result);
            }.bind(this),
          })
    }  

    
    private Func_SuccessEvent(res:any)
    {
        if(res.type == "getUID")
        {
          //收到查询id的数据返回
          gameData.player.id = res.openid;
          this.needWait = false;
          this.CreateCloudData();

          if(this.needUpdatet)
          {
            this.needUpdatet = false;
              if(gameData.player.c_id == gameData.player.id)
              {
                this.mgr.ShowGameTip();

                gameData.player.ifcanChallenge = false;
                gameData.player.c_id = "";
                gameData.player.c_nickName = "";
                gameData.player.c_avatarUrl = "";
                gameData.player.c_maxScore = 0;
              }
              else
              {
                this.mgr.UpdateHomeChallenge();
              }
          }
        }
        else
        {
          // console.log(res)
        }
    }

    private Func_FailEvent(res:any)
    {
         
        //  console.log(res)
    }
}