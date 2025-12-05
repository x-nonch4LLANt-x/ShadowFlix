import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import VideoPlayer from "expo-video-player";
import * as ScreenOrientation from "expo-screen-orientation";
import LoadingTerminal from "../components/LoadingTerminal";
import { getSources } from "../services/api";
import { theme } from "../constants/theme";

const PlayerScreen = () => {
    const route = useRoute();
    const { id, season, episode } = route.params;
    const [sourceUrl, setSourceUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lock to landscape
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

        getSources(id, season, episode).then((data) => {
            // Assuming data structure similar to web logic
            if (Array.isArray(data) && data.length > 0) {
                setSourceUrl(data[0].file || data[0].url);
            } else if (data && (data.url || data.file)) {
                setSourceUrl(data.url || data.file);
            }
            setLoading(false);
        });

        return () => {
            // Unlock orientation on exit
            ScreenOrientation.unlockAsync();
        };
    }, [id, season, episode]);

    if (loading) {
        return (
            <View style={styles.container}>
                <LoadingTerminal />
            </View>
        );
    }

    if (!sourceUrl) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No source available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <VideoPlayer
                videoProps={{
                    shouldPlay: true,
                    resizeMode: Video.RESIZE_MODE_CONTAIN,
                    source: { uri: sourceUrl },
                }}
                fullscreen={{
                    inFullscreen: true,
                    visible: false, // Hide default fullscreen toggle since we force landscape
                }}
                style={{
                    videoBackgroundColor: "black",
                    height: "100%",
                    width: "100%",
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#fff",
        fontSize: 18,
    },
});

export default PlayerScreen;
