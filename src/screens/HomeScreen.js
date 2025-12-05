import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MovingBackground from "../components/MovingBackground";
import GlassContainer from "../components/GlassContainer";
import { getTrending } from "../services/api";
import { theme } from "../constants/theme";

const MediaCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.card}>
        <Image source={{ uri: item.poster_url || item.poster }} style={styles.poster} />
    </TouchableOpacity>
);

const HomeScreen = () => {
    const navigation = useNavigation();
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        getTrending().then(setTrending);
    }, []);

    const handlePress = (item) => {
        navigation.navigate("Details", { id: item.imdb_id || item.id });
    };

    const renderItem = ({ item }) => <MediaCard item={item} onPress={handlePress} />;

    return (
        <View style={styles.container}>
            <MovingBackground />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.logo}>SHADOWFLIX</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {trending.length > 0 && (
                        <View style={styles.hero}>
                            <Image
                                source={{ uri: trending[0].backdrop_url || trending[0].poster }}
                                style={styles.heroImage}
                            />
                            <View style={styles.heroOverlay}>
                                <Text style={styles.heroTitle}>{trending[0].title}</Text>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => handlePress(trending[0])}
                                >
                                    <Text style={styles.playButtonText}>Play Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Trending Now</Text>
                    <FlatList
                        data={trending}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.imdb_id || item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Duplicate rows for demo */}
                    <Text style={styles.sectionTitle}>Popular Movies</Text>
                    <FlatList
                        data={trending}
                        renderItem={renderItem}
                        keyExtractor={(item) => (item.imdb_id || item.id) + "_movies"}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.m,
        alignItems: "center",
    },
    logo: {
        fontSize: 24,
        fontWeight: "bold",
        color: theme.colors.primary,
        letterSpacing: 2,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    hero: {
        height: 400,
        marginBottom: theme.spacing.l,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heroOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.m,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    playButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.l,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    playButtonText: {
        color: theme.colors.text,
        fontWeight: "bold",
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.text,
        marginLeft: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    listContent: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    card: {
        marginRight: theme.spacing.m,
        borderRadius: 8,
        overflow: "hidden",
    },
    poster: {
        width: 120,
        height: 180,
        resizeMode: "cover",
    },
});

export default HomeScreen;
