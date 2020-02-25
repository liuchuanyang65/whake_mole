import {gameData} from "./gameData";
import {WXCloud} from "./WXCloud";

export class Share{

    public static _instance:Share;
    public static wx:any;

    public isChallenge:boolean = false;
    public challengeId = "";

    constructor() {
        Share._instance = this;

        if(Laya.Browser.onMiniGame){
            Share.wx = Laya.Browser.window.wx;
            this.InitShare();
            this.onShow();
        }
    }

    public InitShare(){
        if (Laya.Browser.onWeiXin) {
            console.log("初始化分享设置～");
            Share.wx.showShareMenu({
                withShareTicket: true,
                success: function (res) {
                    console.log("开启转发成功～");
                },
                fail: function (res) {
                    console.log("开启转发失败～");
                },
                complete: function (res) {
    
                }
            });

            Share.wx.onShareAppMessage(function () {
                // const shareInfo = {
                //     title: '打地鼠可好玩了,快来挑战我吧～',//当随机分享内容不可用时使用的默认分享标题
                //     // image: ShareImgUrl.share_gameover//当随机分享内容不可用时使用的默认分享图片
                // };

                return {
                    title: '打地鼠可好玩了,快来挑战我吧～',//当随机分享内容不可用时使用的默认分享标题
                    // image: ShareImgUrl.share_gameover//当随机分享内容不可用时使用的默认分享图片
                };
            })
    
        }
    }

    //挑战分享
    public doShare(nickName:string) {
        var str =  `${nickName}向你发起挑战！`;
        console.log(str);
        if (Laya.Browser.onWeiXin) {
            const shareInfo =  {
                title: str,
                // imageUrl: ShareImgUrl.share_gameover,
                query: `action=challenge&userId=${gameData.player.id}`
            };

            Share.wx.shareAppMessage(shareInfo);
        }
    }

    public onShow() {
        if (Laya.Browser.onWeiXin) {
                Share.wx.onShow(res => {
                    let m_shareTicket = res.shareTicket;
                    
                    let query = res.query;

                    if(query != null)
                    {
                        if(query.action == "challenge")
                        {
                            // action = query.action;
                            // shareTicket = m_shareTicket;
                            console.log(query.userId);
                            this.challengeId = query.userId;
                            // gameData.player.ifcanChallenge = true;
                            // gameData.player.c_id  = query.userId;

                            if(WXCloud._instance.mgr != null)
                            {
                                WXCloud._instance.UpdateChallengeData(this.challengeId);
                            }
                            else
                            {
                                this.isChallenge = true;
                            }
                        }
                    }
                });
        }
    }
}
