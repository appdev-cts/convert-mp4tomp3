
const { uploadOnCloudinary } = require("../config/cloudinary.config");
const axios = require('axios')
const sanitize = require('sanitize-filename');
const fs = require('fs')
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ytdl = require('ytdl-core')

exports.convert = async (req, res) => {
    try {
      const { videoUrl } = req.body;
      if (!videoUrl) {
        return res.status(400).json({ success: false, message: 'Video URL is required.', response: [] });
      }
      let videoReadableStream;
      let videoId;
      const publicPath = path.join(__dirname, '../../public'); 
      const mp4Regex = /\.mp4$/i;
  
      if (ytdl.validateURL(videoUrl)) {
        videoId = ytdl.getVideoID(videoUrl);
        videoReadableStream = ytdl(videoId, { filter: 'audioonly' });
      } else if (mp4Regex.test(videoUrl)) {
        const response = await axios.get(videoUrl, { responseType: 'stream' });
        videoReadableStream = response.data;
        videoId = 'non-youtube-video';
      } else {
        return res.status(400).json({ success: false, message: 'Only MP4 video URLs and YouTube URLs are accepted.', response: [] });
      }
  
  
      const sanitizedFileName = sanitize(`${Date.now()}_${videoId}.mp3`);
      const sanitizedFileNameWithoutSpecialChars = sanitizedFileName.replace(/[^a-zA-Z0-9.]/g, "_");
      const inputPath = path.join(publicPath, 'downloads', sanitizedFileNameWithoutSpecialChars);
      const outputPath = path.join(publicPath, 'output', sanitizedFileNameWithoutSpecialChars);
      const videoWriteStream = fs.createWriteStream(inputPath);
  
      videoReadableStream.pipe(videoWriteStream);
      videoWriteStream.on('finish', async () => {
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(inputPath)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
        });
        const cloudinaryUploadResult = await uploadOnCloudinary(outputPath);
        res.json({
          success: true, message: 'Successfully convert video to mp3 audio',
          response: [{
            audioUrl: cloudinaryUploadResult.secure_url
          }]
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' , response:[] });
    }
  };