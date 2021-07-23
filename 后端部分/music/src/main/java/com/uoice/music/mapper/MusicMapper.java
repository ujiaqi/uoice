package com.uoice.music.mapper;

import com.uoice.music.bean.Banner;
import com.uoice.music.bean.Recommend;
import com.uoice.music.bean.Song;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MusicMapper {



    List<Banner> getBanner();

    List<Recommend> getRecommend();

    Recommend getRecommendDetail(String id);

    List<Song> getSong();

    Song getSongDetail(String ids);




}
