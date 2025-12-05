import React from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "../constants/theme";

const GlassContainer = ({ children, style, intensity = 20 }) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark" />
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.glass,
    },
    content: {
        padding: theme.spacing.m,
    },
});

export default GlassContainer;
