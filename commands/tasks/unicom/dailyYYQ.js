var crypto = require("crypto");
let AES = require("./handlers/PAES");
const useragent = require("./handlers/myPhone").useragent;
const gameEvents = require("./handlers/dailyEvent");
let referer =
  "https://m.jf.10010.com/cms/yuech/unicom-integral-ui/eggachine/index.html?id=Ac-da377d4512124eb49cc3ea4e0d25e379";
/**
 * 欢乐摇摇球
 * 入口:首页=>签到=>免费抽 摇一摇
 *
 */

let dailyYYQ = {
  doTask: async (axios, options) => {
    console.log("🔔 开始欢乐摇摇球\n");
    let cookies = await dailyYYQ.getOpenPlatLine(axios, options);
    let data = await dailyYYQ.postFreeLogin(axios, options, cookies);
    await dailyYYQ.postGame(axios, options, cookies, data);
  },
  getOpenPlatLine: gameEvents.getOpenPlatLine(
    `https://m.client.10010.com/mobileService/openPlatform/openPlatLine.htm?to_url=https://m.jf.10010.com/jf-order/avoidLogin/forActive/stxyndj`
  ),
  postFreeLogin: gameEvents.postFreeLogin(
    referer,
    "Ac-da377d4512124eb49cc3ea4e0d25e379"
  ),
  postGame: async (
    axios,
    options,
    // eslint-disable-next-line no-unused-vars
    { jfid, searchParams, jar1 },
    { activity, Authorization, freeTimes, advertTimes }
  ) => {
    let times = 5;
    // /jf-yuech/api/integralLogs/surplusFreeGame?activityId=Ac-da377d4512124eb49cc3ea4e0d25e379
    do {
      let orderId = "";
      console.log(
        "已消耗机会",
        1 + 4 - (freeTimes + advertTimes),
        "剩余免费机会",
        freeTimes,
        "看视频广告机会",
        advertTimes
      );

      //广告试听
      let res = await axios.request({
        headers: {
          Authorization: `Bearer ${Authorization}`,
          "user-agent": useragent(options),
          referer:
            "https://m.jf.10010.com/cms/yuech/unicom-integral-ui/eggachine/index.html?id=" +
            activity.activityId,
          origin: "https://img.jf.10010.com",
        },
        url: `https://m.jf.10010.com/jf-yuech/api/gameResult/advertFreeGame?activityId=${activity.activityId}`,
        method: "get",
      });

      if (res.data.code !== 0) {
        console.log("签到小游戏视频买扭蛋机: " + res.data.message);
        break;
      }

      if (times < 5) {
        let params = {
          arguments1: "AC20200611152252",
          arguments2: "",
          arguments3: "",
          arguments4: new Date().getTime(),
          arguments6: "",
          arguments7: "",
          arguments8: "",
          arguments9: "",
          netWay: "Wifi",
          remark: "签到小游戏买扭蛋机2",
          version: `android@8.0102`,
          codeId: 945535686,
        };

        params["sign"] = AES.sign([
          params.arguments1,
          params.arguments2,
          params.arguments3,
          params.arguments4,
        ]);
        params["orderId"] = crypto
          .createHash("md5")
          .update(new Date().getTime() + "")
          .digest("hex");
        params["arguments4"] = new Date().getTime();

        await require("./taskcallback").reward(axios, {
          ...options,
          params,
          jar: jar1,
        });

        orderId = params["orderId"];
      }
      //join the game
      let t = {
        activityId: activity.activityId,
        version: 8.0102,
        orderId: orderId,
        phoneType: "android",
      };
      let params = gameEvents.encodeParams(t, true);
      res = await axios.request({
        headers: {
          Authorization: `Bearer ${Authorization}`,
          "user-agent": useragent(options),
          referer:
            "https://m.jf.10010.com/cms/yuech/unicom-integral-ui/eggachine/index.html?id=Ac-da377d4512124eb49cc3ea4e0d25e379",
          origin: "https://m.jf.10010.com",
        },
        url: `https://m.jf.10010.com/jf-yuech/api/gameResult/twisingLuckDraw`,
        method: "post",
        data: params,
      });
      let result = res.data;
      if (result.code !== 0) {
        console.log("❌ 快乐摇摇球:", result.message);
      } else {
        console.log("🎉 快乐摇摇球:", result.data.prizeName);
        if (result.data.doublingStatus) {
          console.log("🎉 提交积分翻倍");
          await dailyYYQ.lookVideoDouble(axios, {
            ...options,
          });
          await dailyYYQ.lookVideoDoubleResult(axios, {
            ...options,
            Authorization,
            activityId: activity.activityId,
            winningRecordId: result.data.winningRecordId,
          });
        }
      }

      console.log("在看视频，等待35秒再继续");
      // eslint-disable-next-line no-unused-vars
      await new Promise((resolve, reject) => setTimeout(resolve, 35 * 1000));
    } while (--times);
  },
  lookVideoDouble: async (axios, options) => {
    let params = {
      arguments1: "AC20200611152252", // acid
      arguments2: "GGPD", // yhChannel
      arguments3: "73e3907bbf9c4748b2fe9a053cee5e82", // yhTaskId menuId
      arguments4: new Date().getTime(), // time
      arguments6: "517050707",
      netWay: "Wifi",
      version: `android@8.0100`,
    };
    params["sign"] = AES.sign([
      params.arguments1,
      params.arguments2,
      params.arguments3,
      params.arguments4,
    ]);
    let { num, jar } = await require("./taskcallback").query(axios, {
      ...options,
      params,
    });

    if (!num) {
      console.log("签到小游戏买扭蛋机2: 今日已完成");
      return;
    }
    params = {
      arguments1: "AC20200611152252", // acid
      arguments2: "GGPD", // yhChannel
      arguments3: "73e3907bbf9c4748b2fe9a053cee5e82", // yhTaskId menuId
      arguments4: new Date().getTime(), // time
      arguments6: "",
      arguments7: "",
      arguments8: "",
      arguments9: "",
      orderId: crypto
        .createHash("md5")
        .update(new Date().getTime() + "")
        .digest("hex"),
      netWay: "Wifi",
      remark: "签到小游戏买扭蛋机2",
      version: `android@8.0100`,
      codeId: 945535686,
    };
    params["sign"] = AES.sign([
      params.arguments1,
      params.arguments2,
      params.arguments3,
      params.arguments4,
    ]);
    await require("./taskcallback").doTask(axios, {
      ...options,
      params,
      jar,
    });
  },
  lookVideoDoubleResult: gameEvents.lookVideoDoubleResult(
    "签到小游戏买扭蛋机2"
  ),
};

module.exports = dailyYYQ;

/**mfc-nftwxl-zupbd4-dui65wykb53n@saf-a0kfgj9z-maty5wwisvf1dziy0.iam.gserviceaccount.com
mfc-w8rkfoicwjakqm--4lx3fme461@saf-wxjtp--y02so45tenqubqzee0o.iam.gserviceaccount.com
mfc-fccafukdecpd4p-1po1usiruof@saf-nuiod9av7go66ohu8s0xpba53w.iam.gserviceaccount.com
mfc-gtohax65zsdwvec1xqg1gf8ubk@saf-q466hy4548f5lhqx7ogue2pyff.iam.gserviceaccount.com
mfc-6t7chlgton03ltmgsmdnlotl70@saf-olz7oyzljls87b2df21s8qkzh5.iam.gserviceaccount.com
mfc-tlh5a-nr8gi4gq8ow7omzhu4of@saf-sl-mlpn1ua3l0f24n9-9bqg7ni.iam.gserviceaccount.com
mfc-dw--bl7ldfucx9-cqrjmpdyupa@saf-uhazlmid4dc7ifve1zib5vubt4.iam.gserviceaccount.com
mfc-fsp-xb2lgexkn8dhy8x7urrzee@saf-jae4fr4mn99azt6z2c5yarpu9s.iam.gserviceaccount.com
mfc-whgklhodhg22iiy2bxnnu4v5cs@saf-k6gig49qxs0hfueotg3a5lv7dr.iam.gserviceaccount.com
mfc-2cxkh1vlw2kr-9mluj8r89qg5a@saf-xoy5x6tn2tev7gl127eskywf59.iam.gserviceaccount.com
mfc-vdpu3f1ok-au91mruaxl4e63x8@saf-k6gig49qxs0hfueotg3a5lv7dr.iam.gserviceaccount.com
mfc-9lnpsbia9axb9m2ek75frmtig5@saf-2l26we-j51t-cajpoh-mrwhu29.iam.gserviceaccount.com
mfc-t1hdbrvxti4z16wxi8tbw09ue5@saf-tppfpi9pznw4bnr5xyqniiacsv.iam.gserviceaccount.com
mfc-yr71c4q1-5cs7xl85suikrtb1v@saf-robj8jn0-1gny97cvwevva0vpj.iam.gserviceaccount.com
mfc-mao0jir80f0kxjklgmocqsjv6c@saf--cidzhzg8253081vzyo737r7ht.iam.gserviceaccount.com
mfc-y7mrerr-hkdbhuddgejw04gk0h@saf-2l26we-j51t-cajpoh-mrwhu29.iam.gserviceaccount.com
mfc-uo1pzb-bog7oi422zqw0wrvupt@saf-4gven39v5-qb4kxcaa3ict0o61.iam.gserviceaccount.com
mfc-hved1ft6pyuoxbx412tz8m0ri6@saf-8cu15qsy-qhowqm5vka5jod5du.iam.gserviceaccount.com
mfc-ze13mhjo7wqg2ldhsbrtcxdme1@saf-a1ur3k756v39upf99blpb3kyf3.iam.gserviceaccount.com
mfc-8abg5yn3mwz0qfked12b7gin7m@saf-il9lkmlek8tqzsftvp7mab7u5y.iam.gserviceaccount.com
mfc-g-z2q8514k-jh1z55iew7ag8rz@saf-7ikys84wehdhz2sd1at3ko96m2.iam.gserviceaccount.com
mfc-sztxbn4nlztv-2w2bewbrknwes@saf-jyh8dkq37nxu18le4593s2ub4v.iam.gserviceaccount.com
mfc-e2nnciqc84v939n3ode6b8wxow@saf--qt959i6hvbtg2moy2rkzkc1zr.iam.gserviceaccount.com
mfc-qkse9yr3exhlm2d129ndpqc0xs@saf-234qj7jpk1mpsdy04qyewqubh9.iam.gserviceaccount.com
mfc-790oq-m2iws9bt39w8-p11ccbd@saf-j9dqyvnyi2t8wr3scrrflzosue.iam.gserviceaccount.com
mfc-jkf-8gc9f7bagap1g4wfwuyrg0@saf-rn63c9c9crq0r-ekfe65anhv0y.iam.gserviceaccount.com
mfc-1g7w2kk24sg8k5cy3cfc3lhdof@saf-9azvg70iptozml5eabrax-nsfy.iam.gserviceaccount.com
mfc-5iskaw917i7n4mwt4fynb6vk6q@saf-wvu-bdk4w6-7dot44wqcdes1zx.iam.gserviceaccount.com
mfc-obj06fr3u2t0aroni816lmmd-q@saf-gks9dyc6j9n5rzhd5uoysqwi9o.iam.gserviceaccount.com
mfc-qoc8oyu46ihn-dzrq0n7gpmewz@saf-7mdt1ehz0wlt19-2wkdwblpvmg.iam.gserviceaccount.com
mfc-s95picn6t752nonkz8nq2kn7j5@saf-fj02mqoc2h410dhwkgpxq1jpyr.iam.gserviceaccount.com
mfc-xz76of0y19k53zzww01-fw9dr8@saf-6t1jncj9s7q--wjdypa6y4oj7m.iam.gserviceaccount.com
mfc-qy19krs8dhrfta94u5d5kdji6i@saf-bjue6pobh6x2qia3513ag6r2u7.iam.gserviceaccount.com
mfc-do-0qpdlqymx46y52nrm0d6oo0@saf-gh8qdq7jnvh813pnk4wwm4cvtz.iam.gserviceaccount.com
mfc-8q8rtl4svpxh-lrkbvz918smvz@saf-2em9-p8n10bkvn7xk00hudcftc.iam.gserviceaccount.com
mfc-y5blbyll5jr85nij4k2r5iaxc8@saf-rkl63z7k8caro75f0n4jzusro5.iam.gserviceaccount.com
mfc-9wabkqco-ce3fqzjb45au5l6t7@saf-6d6qo2oqgr8y7n05i8a988gauo.iam.gserviceaccount.com
mfc-es8aiqevkomcwvrthk-cb1ygwp@saf-av053cdn359fneqecn8gchqlrr.iam.gserviceaccount.com
mfc-anrvo28g-crr2v5sp-fr28mf1v@saf-l7-qa09w1m866pnq8evrdckiwe.iam.gserviceaccount.com
mfc-p-osspcd3icxjvsuu-dvapyetn@saf-q1f4asr4reu46dmdhemcauozwu.iam.gserviceaccount.com
mfc-rgqxksdfavcqu71jthq4t1zk1l@saf-w-z57-tgl4u0hqil-44239xtol.iam.gserviceaccount.com
mfc-hwvi-l5kovjiegpjfgbskwk9d2@saf-ecbx9cmlgm4sy2eiwje78k0ris.iam.gserviceaccount.com
mfc-ewy9dxphcqp8ql-tg0ypoz34ld@saf-0hu2f00gdbzpuv0u3g9c1yur9p.iam.gserviceaccount.com
mfc-1ey6red6tg-000nh8xo7nbsolf@saf-u4tjprhmswxsusl-483rd47wt5.iam.gserviceaccount.com
mfc-irxl10dtpyc6p2u5fgwqy5fin6@saf-mj07jka8mwsi22-hjvsloa718k.iam.gserviceaccount.com
mfc-4w5fnjxke3ep5qkl-aaq3p0ae2@saf-2em9-p8n10bkvn7xk00hudcftc.iam.gserviceaccount.com
mfc-fhsq7ss8b1vgev5h-vfnr1205t@saf-6x6adtoeh7by6cmo0mmcazihi9.iam.gserviceaccount.com
mfc-x5m1xn6yj67070xas22-om5hbj@saf-jyh8dkq37nxu18le4593s2ub4v.iam.gserviceaccount.com
mfc-8bx1971tt5d58n9bkla1a0gzn2@saf-y6fgyyhul91zwt79rbmu0lohnd.iam.gserviceaccount.com
mfc-qdwoxvfv93kwuflmv2q2h1ojg8@saf-whrh699ig62wnkxm-6hl3kkx4i.iam.gserviceaccount.com
mfc-ra4kieynp02yebcac8ik636d5r@saf-xis3r58aa-y-ntacgzejaqnavp.iam.gserviceaccount.com
mfc-qpd1sk7o6rljx026ug3cgxb5lw@saf-6n5x1zb53315lh7h98rbckmnf6.iam.gserviceaccount.com
mfc-9j1p0mnm5ilcz-n5myhgesux0v@saf-mj07jka8mwsi22-hjvsloa718k.iam.gserviceaccount.com
mfc-3h31olundxjalw8qr2i3oyjf90@saf-ca0hozyjidy0snziccdw0-dinu.iam.gserviceaccount.com
mfc-e5onvo344bets-ijx0flbwm1g9@saf-d28wjt131mxth063bp-8-384-m.iam.gserviceaccount.com
mfc-4g5-x1wpjuiex0prbxvl27oua3@saf-gh8qdq7jnvh813pnk4wwm4cvtz.iam.gserviceaccount.com
mfc--jlb71nxcwle0t8u822yswpmci@saf-gpykn074wt2ff2u06njidal8ux.iam.gserviceaccount.com
mfc-ptdlnh8dq3mb7rcq64i83ijq9l@saf-659pa-5z469wc-4rppiecwva6w.iam.gserviceaccount.com
mfc-ads8zahf5a7zvln04hqhyhdx4c@saf-pyzzugz8e166qlk3hl3ek8bxlm.iam.gserviceaccount.com
mfc-2i8l6ip2-p67ceqw06-wgoaj0k@saf-jt3v4lwuk-lra5o2fdp8qd3wco.iam.gserviceaccount.com
mfc-k0lsacgv7g36b-idd8j6iv9opt@saf-7mdt1ehz0wlt19-2wkdwblpvmg.iam.gserviceaccount.com
mfc-fs710vxdn04qiceha7hxdc4hx1@saf-h1v3imtg4ngo2szcfdpu9mi2ci.iam.gserviceaccount.com
mfc-x6lpdbnpu0s71bhhtn22hyde64@saf-wq96m7z8t9-hxfhm457eynx9ol.iam.gserviceaccount.com
mfc-x-73lh25d41k36cnbx03p1uuxe@saf-jote07wy85zo7qvq-ue5of8wth.iam.gserviceaccount.com
mfc-dbdfowzpmsgwol7knvdd63hxtw@saf-dxzwzkh0czxrj0gga5h75jlv59.iam.gserviceaccount.com
mfc-0m5qwpyjaju8wihd93uxumnx-p@saf-asb3glva1jwprq7s9d857ho10o.iam.gserviceaccount.com
mfc-rjo13q969jc5w1pw2g8wzg9456@saf-qlz67edz8vac74r0nx1ygjx00r.iam.gserviceaccount.com
mfc-emoachhg5gnoznvrs38noo25n9@saf-s7wzb9nvrtqy2d04dcdutkfnwr.iam.gserviceaccount.com
mfc-y18osug08qbeg2plt77yz4l3vd@saf-5e8rsweugimpyclowh46j8zm2v.iam.gserviceaccount.com
mfc-bkg6o4x2cy-awsk3w4micpdeod@saf-cqj8xq5kahqt6holc5x1sdal29.iam.gserviceaccount.com
mfc-ga3yzn1i418ltlnp8uvxniktsn@saf-0dme6pqsn8qmodm7j9ce3k2yn7.iam.gserviceaccount.com
mfc-hjwd99ugdzs38ea2r6w23f9m24@saf-7pl87ukivvar4d-4odpllxe3er.iam.gserviceaccount.com
mfc-epomvlig7sohnaggqi2cgg4foo@saf-yultqoon-yro981y6s1tzgildb.iam.gserviceaccount.com
mfc-ulkxjv-2g7nlxwntvkybjarrjw@saf-f6kqxzbq-qgsdw5u9hzlr8d-pn.iam.gserviceaccount.com
mfc-ioe2cdgwkogzjf1ri4l8g4bce8@saf-zq4rktf3tnj-jzt7kkio45szcn.iam.gserviceaccount.com
mfc-yy1pdshxwnppjmbfd8ibdljosv@saf-g8-z4plk64f-u-4giuqeywwl-y.iam.gserviceaccount.com
mfc-oaoon-sqqsl4w5-7l83wof9avv@saf-ec8uf85uz4yd1c03tinpm0ky-n.iam.gserviceaccount.com
mfc-z7tmkejrkfl41n8x3mymyqb6e6@saf-4gven39v5-qb4kxcaa3ict0o61.iam.gserviceaccount.com
mfc-fr5z92kxb5-pl7ol8rm21rnmlg@saf-vgyv1a5v5-fster1gl7lnfh40o.iam.gserviceaccount.com
mfc-ti176z2gnni-3oheu98yfq0n8s@saf-r-cynzqn8i031bpofh6tyd3py5.iam.gserviceaccount.com
mfc-ft49mxizd9td4du4gju-fj2vm3@saf-y9i0ng92-p9nci38r08z6-090e.iam.gserviceaccount.com
mfc-9hwecd91x0m5cichi1usxcm8lf@saf--v18harqma53slg40eqgwe-uou.iam.gserviceaccount.com
mfc-kwy-7ba0-2yafzx4dfpyata37w@saf-jn-aozttb7u0c49njm8hq189l3.iam.gserviceaccount.com
mfc-6qo6lizj5c4argdpfiztgpkd0w@saf-ak7k-3tw88rfd89h14lw92k52q.iam.gserviceaccount.com
mfc-ogj356a4airakpcsi45aru4153@saf-7cpz3go82e6hbes85o8thsm55r.iam.gserviceaccount.com
mfc-o154slid03zmzcfsaksd6jjdxh@saf-qjtkhket9b0l7jq9eqp6jtx48j.iam.gserviceaccount.com
mfc-37o0ihjeerw4p5cviejkc95rjb@saf-tm5vmbdbif46r8602y5xfj4g54.iam.gserviceaccount.com
mfc-sui3ja4gp3emnc70y2p1zsobmb@saf-10zb5l71ln1t0txd058asizuk2.iam.gserviceaccount.com
mfc-6zuanua0sz3zhr09k2ufhc49nu@saf-yl8emm6pwhamcieyfox9zb6k9g.iam.gserviceaccount.com
mfc-d1lham-le-zdl13o-8o0o5dmif@saf-xaygga733ocuj9-7hqg40iqy8k.iam.gserviceaccount.com
mfc-vkuf5wso86peq6gt1u2la03lot@saf-scoybcs9b3we0uw13cl5uht9vb.iam.gserviceaccount.com
mfc-zetpft76-mmh4uk83nkkmpyxu7@saf-essp2lka0g8f4x87ls7u-cvylv.iam.gserviceaccount.com
mfc-bgbnzlj3pjqx56fvsa2d0ihw2v@saf-j7sou43ab84sw1hfq86btu85mr.iam.gserviceaccount.com
mfc-kg4k2ldrtpisdyquqvygwyqreo@saf-sb3day-18sby4lct79dfcnj3yu.iam.gserviceaccount.com
mfc-73mf9jpxzawv6a7x714hplcnwb@saf-c6v-ohlez7t1-ptv0fnuurb-4c.iam.gserviceaccount.com
mfc-a1jx1efm9z3kao7h2pac7g3p-c@saf-xis3r58aa-y-ntacgzejaqnavp.iam.gserviceaccount.com
mfc-zbb7thk5344nfiglka9lb6d6we@saf-yc-os3srz15uplb9-i9hky0dnj.iam.gserviceaccount.com
mfc-xy5ul2bpbt6cf844acac5q90fc@saf-m9cqkg9wgj1lvs71p1q9z9awo6.iam.gserviceaccount.com
mfc-u6u46vq2vdsaxs2wutxohb8-co@saf-4tt3k4sr4e9s7uiobccumizmho.iam.gserviceaccount.com
mfc-b-phs09h7195f91tqimn3seklr@saf-67iyljctta0tv0bv-k4dhq0sxb.iam.gserviceaccount.com
*/
