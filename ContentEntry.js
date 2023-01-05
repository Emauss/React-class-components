import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CheckBox } from "react-native-elements";
import Header from "../components/Header";
import ListLocations from "../containers/ListLocations";
import ListLocationsIOS from "../containers/ListLocationsIOS";
import { connect } from "react-redux";
import {
  notifAcceptFetched,
  streetFetched,
  trashesFetched,
  streetIdFetched,
  closestTrashesFetched,
  newsFetched,
  pushTokenFetched,
  scheduleDatesFetched,
} from "../actions";
import Request from "../api/Request";
import registerForPushNotificationsAsync from "../containers/GenerateExpoPushToken";
import { getClosestDates } from "../helpers/getClosestDates";
import { notifScheduling } from "../helpers/notifScheduling";

class ContentEntry extends React.Component {
  constructor() {
    super();
    this.state = {
      setSelection: false,
      checked: false,
      actuallyStreet: 0,
      expoPushToken: "",
      futureDates: [],

      mixedTrashClosest: {},
      plasticTrashClosest: {},
      glassTrashClosest: {},
      maculatureTrashClosest: {},
      bioTrashClosest: {},
      ashTrashClosest: {},
      hugeTrashClosest: {},
    };
  }

  componentDidMount() {
    this.setState({
      actuallyStreet: this.props.streetId[0],
    });
  }

  ChangeValue = () => {
    if (this.props.notifAccept[0] !== "Powiadomienia") {
      this.props.notifAcceptFetched(["Powiadomienia"]);
    } else {
      this.props.notifAcceptFetched([]);
    }
    this.setState({ checked: !Boolean(this.props.notifAccept[0]) });
  };

  ChangeLocation = () => {
    this.props.navigation.navigate("Panel");
    Request.getNews(this.props.streetId[0], async (response) => {
      const news = response.notyfications.filter(
        (value, index, self) => index === self.findIndex((t) => t.place === value.place && t.name === value.name)
      );
      await this.props.newsFetched(news.reverse());
    });

    if (this.props.streetId[0] !== this.state.actuallyStreet) {
      Request.getDates(this.props.streetId[0], async (response) => {
        try {
          await this.props.trashesFetched({
            mixedTrash: JSON.parse(response.dates.mixedTrash),
            plasticTrash: JSON.parse(response.dates.plasticTrash),
            glassTrash: JSON.parse(response.dates.glassTrash),
            maculatureTrash: JSON.parse(response.dates.maculatureTrash),
            bioTrash: JSON.parse(response.dates.bioTrash),
            ashTrash: JSON.parse(response.dates.ashTrash),
            hugeTrash: JSON.parse(response.dates.hugeTrash),
          });

          this.setState({
            actuallyStreet: this.props.streetId[0],
          });

          this.props.closestTrashesFetched(getClosestDates(this.props.trashes));
        } catch (err) {
          console.warn(err);
          this.props.trashesFetched({});
          this.props.closestTrashesFetched([]);
        }
      });
    }

    registerForPushNotificationsAsync().then((token) => {
      if (this.props.pushToken[0] !== token || this.props.streetId[0] !== this.state.actuallyStreet) {
        this.setState({ expoPushToken: token }, async () => {
          await this.props.pushTokenFetched([]);
          await this.props.pushTokenFetched([this.state.expoPushToken]);

          Request.createMobileUser(
            this.props.pushToken[0],
            this.props.streetId[0],
            this.props.notifAccept[0] === "Powiadomienia" ? 1 : 0,
            async (response) => {
              if (response.success) {
                const message = {
                  to: this.props.pushToken[0],
                  sound: "default",
                  title: "Witaj w aplikacji!",
                  body: "Będziemy Ci przypominać o wywózkach na biężaco :)",
                };

                await fetch("https://exp.host/--/api/v2/push/send", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Accept-encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(message),
                });
              }
            }
          );
        });
      }
    });

    if (this.props.streetId[0] !== this.state.actuallyStreet) {
      this.GetDatesNotifications();
    }
  };

  GetDatesNotifications = async () => {
    const now = new Date();
    let currentDate = [];

    Object.keys(this.props.trashes).forEach((simpleTrash) => {
      currentDate = [];

      this.props.trashes[simpleTrash].forEach((simpleDate) => {
        let date = new Date(simpleDate.year, simpleDate.month - 1, simpleDate.day - 1, 16, 0);

        if (date >= now) {
          currentDate.push(date);
        }
      });

      currentDate.sort(function (a, b) {
        return a.getTime() - b.getTime();
      });

      if (currentDate.length > 5) {
        currentDate = currentDate.slice(0, 5);
      }

      this.state.futureDates.push({ [simpleTrash]: currentDate });
    });

    await this.props.scheduleDatesFetched(this.state.futureDates);
    notifScheduling(this.props.scheduleDates);
  };

  render() {
    return (
      <View style={{ backgroundColor: "#f0fff1", height: "100%" }}>
        <Header />
        <View style={styles.EntryContainer}>
          <View style={styles.content}>
            <Text>
              Godziny otwarcia: {"\n"}
              poniedziałek: 7:00 - 16:00 {"\n"}wtorek-czwartek: 7:00 - 15:00
            </Text>
          </View>
          <View style={styles.inputs}>
            {Platform.OS === "ios" ? <ListLocationsIOS /> : <ListLocations />}
            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxWrapper}>
                <CheckBox
                  disabled={this.props.street[0] == [] || this.props.street[0] == undefined ? true : false}
                  style={styles.checkbox}
                  checked={Boolean(this.props.notifAccept[0])}
                  onPress={this.ChangeValue}
                  checkedColor="#39b54a"
                  containerStyle={styles.checkBoxStyle}
                  title="Firma chce wysyłać Ci powiadomienia."
                  textStyle={styles.checkboxText}
                />
              </View>
            </View>
            {this.props.street[0] ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.greenButton}
                  onPress={() => {
                    this.ChangeLocation();
                  }}
                >
                  <Text style={styles.textSubmitButton}>{"Przejdź".toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  entryScreen: {
    alignItems: "center",
  },

  EntryContainer: {
    maxWidth: "80%",
    alignSelf: "center",
  },

  content: {
    marginTop: 30,
    marginBottom: 30,
  },

  checkBoxStyle: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  checkboxWrapper: {
    width: "100%",
  },

  checkboxText: {
    fontWeight: "400",
  },

  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  greenButton: {
    backgroundColor: "#39b54a",
    borderRadius: 5,
    padding: 10,
    textTransform: "uppercase",
  },

  textSubmitButton: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },

  label: {
    marginBottom: 8,
    marginTop: 8,
  },

  button: {
    backgroundColor: "#339a41",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
  },

  textButton: {
    color: "#fff",
  },

  buttonContainer: {
    paddingLeft: 150,
  },
});

const mapStateToProps = (state) => {
  return {
    notifAccept: state.notifAccept,
    street: state.street,
    trashes: state.trashes,
    streetId: state.streetId,
    closestTrashes: state.closestTrashes,
    news: state.news,
    pushToken: state.pushToken,
    scheduleDates: state.scheduleDates,
  };
};

const mapDispatchToProps = {
  notifAcceptFetched,
  streetFetched,
  trashesFetched,
  streetIdFetched,
  closestTrashesFetched,
  newsFetched,
  pushTokenFetched,
  scheduleDatesFetched,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentEntry);
