import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import BudgetsListScreen from "./BudgetsListScreen";
import { colors, typography, spacing } from "../../constants/colors";

interface BudgetsScreenProps {
  navigation: any;
}

const BudgetsScreen: React.FC<BudgetsScreenProps> = ({ navigation }) => {
  // Use the new BudgetsListScreen component
  return <BudgetsListScreen navigation={navigation} />;
};

export default BudgetsScreen;
