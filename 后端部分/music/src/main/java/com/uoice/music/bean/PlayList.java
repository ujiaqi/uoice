package com.uoice.music.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("playList")
public class PlayList {
    int id;
    String name;
    String coverImgUrl;
    String picUrl;
    String description;
    List<Song> tracks;
    List<MusicInfo> trackIds;
}
