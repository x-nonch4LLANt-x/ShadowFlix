import React, { useState } from "react";
import { StyleSheet, View, TextInput, FlatList, Image, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MovingBackground from "../components/MovingBackground";
import { searchContent } from "../services/api";
import { theme } from "../constants/theme";

const SearchScreen = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearch = async (text) => {
        setQuery(text);
        if (text.length > 1) { // Faster trigger
            const data = await searchContent(text);
            setResults(data || []);
            setShowSuggestions(true);
        } else {
            setResults([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionPress = (item) => {
        setQuery(item.title);
        setShowSuggestions(false);
        navigation.navigate("Details", { id: item.imdb_id || item.id });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate("Details", { id: item.imdb_id || item.id })}
            style={styles.card}
        >
            <Image source={{ uri: item.poster_url || item.poster }} style={styles.poster} />
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <MovingBackground />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search movies & TV..."
                        placeholderTextColor="#aaa"
                        value={query}
                        onChangeText={handleSearch}
                    />
                    {showSuggestions && results.length > 0 && (
                        <View style={styles.suggestions}>
                            {results.slice(0, 5).map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSuggestionPress(item)}
                                >
                                    <Text style={styles.suggestionText}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.imdb_id || item.id}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                />
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
    searchContainer: {
        padding: theme.spacing.m,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: theme.spacing.m,
        borderRadius: 8,
        color: theme.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    suggestions: {
        position: "absolute",
        top: 70,
        left: 16,
        right: 16,
        backgroundColor: "rgba(20,20,20,0.95)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        zIndex: 10,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    suggestionText: {
        color: "#ccc",
        fontSize: 16,
    },
    listContent: {
        padding: theme.spacing.s,
    },
    card: {
        flex: 1,
        margin: theme.spacing.s,
        maxWidth: "30%",
    },
    poster: {
        width: "100%",
        aspectRatio: 2 / 3,
        borderRadius: 4,
        marginBottom: 4,
    },
    title: {
        color: "#ccc",
        fontSize: 12,
        textAlign: "center",
    },
});

export default SearchScreen;
