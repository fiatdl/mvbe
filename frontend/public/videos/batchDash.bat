chcp 65001
ffmpeg -re -i 無意識.mp4 -map 0 -map 0 -codec: copy -b:v:0 800k -b:v:1 300k -s:v:1 320x170 -bf 1 -keyint_min 120 -g 120 -sc_threshold 0 -b_strategy 0 -ar:a:1 22050 -use_timeline 1 -use_template 1 -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" -f dash dash/無意識.mpd