import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MovingBackground from "../components/MovingBackground";
import { getDetails, getSources } from "../services/api";
import { theme } from "../constants/theme";
import * as FileSystem from 'expo-file-system';

const DetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDetails(id).then((data) => {
            setItem(data);
            setLoading(false);
        });
    }, [id]);

    const downloadMovie = async () => {
        if (!item) return;
        // Fetch source first
        const sources = await getSources(item.imdb_id || item.id);
        let url = null;
        if (Array.isArray(sources) && sources.length > 0) {
            url = sources[0].file || sources[0].url;
        } else if (sources && (sources.url || sources.file)) {
            url = sources.url || sources.file;
        }

        if (!url) {
            alert("No source available to download");
            return;
        }

        const filename = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
        const uri = FileSystem.documentDirectory + filename;

        const downloadResumable = FileSystem.createDownloadResumable(
            url,
            uri,
            {},
            (progress) => {
                console.log(`Downloaded: ${progress.totalBytesWritten / progress.totalBytesExpectedToWrite * 100}%`);
            }
        );

        try {
            const { uri } = await downloadResumable.downloadAsync();
            alert("Downloaded to " + uri);
        } catch (e) {
            console.error(e);
            alert("Download failed");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <MovingBackground />
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!item) return null;

    return (
        <View style={styles.container}>
            <MovingBackground />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.backdropContainer}>
                    <Image source={{ uri: item.backdrop_url || item.poster }} style={styles.backdrop} />
                    <LinearGradient
                        colors={["transparent", theme.colors.background]}
                        style={styles.gradient}
                    />
                </View>

                <View style={styles.content}>
                    <Image source={{ uri: item.poster_url || item.poster }} style={styles.poster} />
                    <Text style={styles.title}>{item.title}</Text>

                    <View style={styles.meta}>
                        <Text style={styles.metaText}>{item.year}</Text>
                        <Text style={styles.metaText}> • </Text>
                        <Text style={styles.metaText}>{item.rating} ★</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => navigation.navigate("Player", { id: item.imdb_id || item.id })}
                    >
                        <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.playButton, { backgroundColor: "#333" }]}
                        onPress={downloadMovie}
                    >
                        <Text style={styles.playButtonText}>Download</Text>
                    </TouchableOpacity>

                    <Text style={styles.overview}>{item.overview}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: 50,
    },
    backdropContainer: {
        height: 300,
        width: "100%",
        position: "relative",
    },
    backdrop: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        opacity: 0.6,
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 150,
    },
    content: {
        padding: theme.spacing.m,
        marginTop: -50,
        alignItems: "center",
    },
    poster: {
        width: 150,
        height: 225,
        borderRadius: 8,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: theme.colors.text,
        textAlign: "center",
        marginBottom: theme.spacing.s,
    },
    meta: {
        flexDirection: "row",
        marginBottom: theme.spacing.l,
    },
    metaText: {
        color: "#ccc",
        fontSize: 16,
    },
    playButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 4,
        marginBottom: theme.spacing.l,
        width: "100%",
        alignItems: "center",
    },
    playButtonText: {
        color: theme.colors.text,
        fontWeight: "bold",
        fontSize: 18,
    },
    overview: {
        color: "#ddd",
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
    },
});

export default DetailsScreen;
