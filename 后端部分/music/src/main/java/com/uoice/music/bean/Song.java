package com.uoice.music.bean;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@Alias("song")
@AllArgsConstructor
@NoArgsConstructor
public class Song {
    private int id;
    private String name;
    private String picUrl;
    private String author;
    private Long dt;
    private String url;
    private String lyric;
}
