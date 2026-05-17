import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const THEME = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#E2E8F0',
  accent: '#E6E6FA', // Lavender
  radius: 20,
};

// Curated library of Somatic and Yoga Flows
const VIDEO_LIBRARY = [
  { id: 'txQz1sM2F2w', title: 'Morning Somatic Flow', thumbnail: 'https://img.youtube.com/vi/txQz1sM2F2w/hqdefault.jpg' },
  { id: 'v7AYKMP6rOE', title: 'Nervous System Reset', thumbnail: 'https://img.youtube.com/vi/v7AYKMP6rOE/hqdefault.jpg' },
  { id: '4pLUleLdwY4', title: '5-Minute Stretching', thumbnail: 'https://img.youtube.com/vi/4pLUleLdwY4/hqdefault.jpg' },
];

export const ActivityMedia = () => {
  const [activeVideoId, setActiveVideoId] = useState(VIDEO_LIBRARY[0].id);
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Dedicated Player View Container */}
      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={220}
          play={playing}
          videoId={activeVideoId}
          onChangeState={onStateChange}
          webViewStyle={styles.webView}
        />
      </View>

      {/* Horizontal Carousel */}
      <Text style={styles.sectionTitle}>Curated Flows</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {VIDEO_LIBRARY.map((video) => {
          const isActive = video.id === activeVideoId;
          return (
            <TouchableOpacity 
              key={video.id} 
              style={[styles.thumbnailCard, isActive && styles.thumbnailCardActive]}
              onPress={() => {
                setActiveVideoId(video.id);
                setPlaying(true); // Auto-play when selected from carousel
              }}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: video.thumbnail }} 
                style={styles.thumbnailImage} 
              />
              <View style={styles.thumbnailOverlay}>
                <Text style={styles.thumbnailTitle} numberOfLines={2}>
                  {video.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  playerContainer: {
    borderRadius: THEME.radius,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // Subtle luxury border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  webView: {
    opacity: 0.99, // Hack to prevent crashing on some WebViews
  },
  sectionTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  carouselContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  thumbnailCard: {
    width: 160,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.card,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailCardActive: {
    borderColor: THEME.accent, // Soft bioluminescent accent
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7, // Muted for Dark Luxury feel
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep Navy gradient effect
  },
  thumbnailTitle: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '500',
  },
});
