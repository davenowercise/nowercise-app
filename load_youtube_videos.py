import csv
import json

def load_videos(file_path="youtube_video_list.csv"):
    """
    Load YouTube video data from CSV file
    """
    try:
        with open(file_path, newline='', encoding="utf-8") as csvfile:
            videos = list(csv.DictReader(csvfile))
            return videos
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return []
    except Exception as e:
        print(f"Error loading videos: {e}")
        return []

def format_video_data(videos):
    """
    Format video data for use in the application
    """
    formatted_videos = []
    
    for video in videos:
        formatted_video = {
            'id': video.get('id', ''),
            'title': video.get('title', ''),
            'description': video.get('description', ''),
            'url': video.get('url', ''),
            'thumbnail': video.get('thumbnail', ''),
            'duration': video.get('duration', ''),
            'published_at': video.get('published_at', ''),
            'channel_title': video.get('channel_title', ''),
            'view_count': video.get('view_count', '0'),
            'like_count': video.get('like_count', '0'),
            'tags': video.get('tags', '').split(',') if video.get('tags') else []
        }
        formatted_videos.append(formatted_video)
    
    return formatted_videos

def save_as_json(videos, output_path="youtube_videos.json"):
    """
    Save videos as JSON file
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(videos, jsonfile, indent=2, ensure_ascii=False)
        print(f"Videos saved to {output_path}")
    except Exception as e:
        print(f"Error saving videos: {e}")

def main():
    # Load videos from CSV
    videos = load_videos()
    print(f"Loaded {len(videos)} videos.")
    
    if videos:
        print("First video sample:")
        print(videos[0])
        
        # Format the data
        formatted_videos = format_video_data(videos)
        
        # Save as JSON for use in the application
        save_as_json(formatted_videos)
        
        # Show some stats
        print(f"\nVideo Statistics:")
        print(f"Total videos: {len(formatted_videos)}")
        
        # Show unique channels
        channels = set(video['channel_title'] for video in formatted_videos if video['channel_title'])
        print(f"Unique channels: {len(channels)}")
        
        if channels:
            print("Channels:")
            for channel in sorted(channels):
                print(f"  - {channel}")

if __name__ == "__main__":
    main()