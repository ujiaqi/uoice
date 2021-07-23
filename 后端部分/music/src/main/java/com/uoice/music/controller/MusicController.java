package com.uoice.music.controller;

import com.uoice.music.bean.MusicInfo;
import com.uoice.music.bean.PlayList;
import com.uoice.music.bean.Recommend;
import com.uoice.music.bean.Song;
import com.uoice.music.mapper.MusicMapper;
import com.uoice.music.util.SendSms;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class MusicController {

    @Resource
    private MusicMapper musicMapper;
    
    @RequestMapping("/banners")
    public Map<String, Object> getBanners(){
        Map<String, Object> map = new HashMap<>();
        map.put("code","200");
        map.put("banners", musicMapper.getBanner());
        return map;
    }


    @RequestMapping("/getRecommend")
    public Map<String, Object> getRecommend(){
        Map<String, Object> map = new HashMap<>();
        map.put("code","200");
        map.put("result", musicMapper.getRecommend());
        return map;
    }

    @RequestMapping("/getTopList")
    public Map<String, Object> getTopList(){
        Map<String, Object> map = new HashMap<>();
        map.put("code","200");
        map.put("list", musicMapper.getRecommend());
        return map;
    }

    @RequestMapping("/getSong")
    public Map<String, Object> getSong(String id){
        Map<String, Object> map = new HashMap<>();
        Recommend recommendDetail = musicMapper.getRecommendDetail(id);
        List<Song> song = musicMapper.getSong();

        List<MusicInfo> musicInfos = new ArrayList<>();
        for (int i = 1; i <= song.size(); i++) {
            MusicInfo musicInfo = new MusicInfo();
            musicInfo.setId(song.get(i-1).getId());
            musicInfo.setName(song.get(i-1).getName());
            musicInfos.add(musicInfo);
        }


        PlayList playList = new PlayList();
        playList.setId(recommendDetail.getId());
        playList.setName(recommendDetail.getName());
        playList.setCoverImgUrl(recommendDetail.getCoverImgUrl());
        playList.setDescription(recommendDetail.getDescription());
        playList.setPicUrl(recommendDetail.getPicUrl());
        playList.setTrackIds(musicInfos);
        playList.setTracks(song);
        map.put("code","200");
        map.put("playlist", playList);


        return map;
    }


    @RequestMapping("/getSongDetail")
    public Map<String, Object> getSongDetail(String ids){
        Map<String, Object> map = new HashMap<>();
        map.put("code","200");
        map.put("songs", musicMapper.getSongDetail(ids));
        return map;
    }

    @RequestMapping("/getCode")
    public Map<String, Object> getCode(@Param("phone") String phone, HttpSession session){
        Map<String, Object> map = new HashMap<>();

        if (phone.length()!=11 ){

            map.put("status","lengthError");
        }else{
            try {
                Long.parseLong(phone);
            }catch (Exception e){
                e.printStackTrace();
                map.put("status","numberError");
                return map;
            }
            String random=(int)((Math.random()*9+1)*100000)+"";
            session.setAttribute(phone, random);
            SendSms.sendSms("+86" + phone, random, "806352");
            map.put("status","ok");
        }

        return map;
    }


    @RequestMapping("/loginPhone")
    public Map<String, Object> loginPhone(String phone, @Param("code") String code, HttpSession session){

        Map<String, Object> map = new HashMap<>();
        String trueCode = (String) session.getAttribute(phone);
        if (!StringUtils.isEmpty(trueCode)){
            if(trueCode.equals(code)){

                map.put("code","ok");
                map.put("status",1);
                session.removeAttribute(phone);
            }else {
                map.put("code","验证码有误");
            }
        }else{
            map.put("code", "验证码失效");
        }
        return map;
    }




}
