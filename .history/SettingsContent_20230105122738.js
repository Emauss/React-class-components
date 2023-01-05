import React from "react";
import { StyleSheet, Text, View, ScrollView, Button } from "react-native";
import { CheckBox } from "react-native-elements";
import Header from "./Header";
import SelectedLocation from "./SelectedLocation";
import { connect } from "react-redux";
import { notifAcceptFetched, scheduleDatesFetched } from "../actions";
import { TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";
import Request from "../api/Request";
import { notifScheduling } from "../helpers/notifScheduling";

class SettingsContent extends React.Component {
  constructor() {
    super();
    this.state = {
      checked: false,
      settings: {},
      loading: true,
    };
  }

  componentDidMount() {
    Request.getInfo((response) => {
      if (response?.settings) {
        this.setState({ settings: response.settings, loading: false });
      }
    });
  }

  ChangeValue = async () => {
    if (this.props.notifAccept[0] !== "Powiadomienia") {
      this.props.notifAcceptFetched(["Powiadomienia"]);
      notifScheduling(this.props.scheduleDates);
    } else {
      this.props.notifAcceptFetched([]);
      Notifications.cancelAllScheduledNotificationsAsync();
    }
    this.setState({ checked: !Boolean(this.props.notifAccept[0]) });
  };

  render() {
    return (
      <View style={styles.contactContainer}>
        <Header />
        <SelectedLocation />
        <ScrollView style={styles.settingsWrapper}>
          <Text style={styles.settingsTitle}>Ustawienia</Text>
          <View>
            <TouchableOpacity style={styles.greenButton} onPress={() => this.props.navigation.navigate("Lokalizacja")}>
              <Text style={styles.textSubmitButton}>{"Zmien lokalizację".toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.checkboxContainer}>
            <CheckBox
              style={styles.checkbox}
              checked={Boolean(this.props.notifAccept[0])}
              onPress={this.ChangeValue}
              checkedColor="#39b54a"
              containerStyle={styles.checkBoxStyle}
              title="Firma chce wysyłać Ci powiadomienia."
              textStyle={styles.checkboxText}
            />
          </View>
          <View style={styles.informationWrapper}>
            <Text style={styles.settingsSubTitle}>O spółce:</Text>
            <Text style={styles.label}>{this.state.loading ? "Ładowanie zawartości..." : this.state.settings?.about_us}</Text>
          </View>
          {!this.state.loading && (
            <View style={styles.informationWrapper}>
              <Text style={styles.settingsSubTitle}>Załączniki:</Text>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("About", { aboutApp: this.state.settings?.about_app })}>
                <Text style={styles.links}>O aplikacji</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Privacy", { privacy: this.state.settings?.privacy_policy })}>
                <Text style={styles.links}>Polityka prywatności</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("AppAvailability", { availability: this.state.settings?.availability })}
              >
                <Text style={styles.links}>Deklaracja dostępności aplikacji mobilnej</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("PersonalData", { personal: this.state.settings?.personal_data })}>
                <Text style={styles.links}>Oświadczenie o przekazywaniu danych osobowych</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contactContainer: {
    alignItems: "center",
    flex: 1,
    height: "100%",
  },

  settingsWrapper: {
    marginTop: 30,
    marginBottom: 15,
    paddingRight: 80,
    paddingLeft: 40,
  },

  settingsTitle: {
    fontSize: 24,
    marginBottom: 25,
    fontWeight: "400",
  },

  settingsSubTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
  },

  checkboxText: {
    fontWeight: "400",
  },

  checkBoxStyle: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  greenButton: {
    backgroundColor: "#39b54a",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  textSubmitButton: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },

  label: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 0,
  },

  links: {
    marginTop: 5,
    marginBottom: 8,
    color: "#39b54a",
    fontWeight: "600",
  },

  buttonWrapper: {
    marginTop: 15,
    paddingRight: 100,
    width: "100%",
  },

  informationWrapper: {
    marginTop: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    notifAccept: state.notifAccept,
    scheduleDates: state.scheduleDates,
  };
};

const mapDispatchToProps = { notifAcceptFetched, scheduleDatesFetched };

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContent);
