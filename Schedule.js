import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Header from "../components/Header";
import SelectedLocation from "../components/SelectedLocation";
import { connect } from "react-redux";
import { streetIdFetched, trashesFetched, closestTrashesFetched } from "../actions";
import Request from "../api/Request";
import { validationDate } from "../helpers/validationDate";
import { TRASHES } from "../models/trashes";
import { getClosestDates } from "../helpers/getClosestDates";

class Schedule extends React.Component {
  constructor() {
    super();

    this.state = {
      actuallyData: "",
      dates: {},
      schedule: "",
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
    Request.getInfo((response) => {
      if (response?.settings?.schedule_date) {
        this.setState({ schedule: response.settings.schedule_date });
      }
    });

    this.setState({
      actuallyData: this.props.streetId[0],
    });

    this.GetDates();
  }

  GetDates = () => {
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
        alert("Nie możemy załadować dat do harmonogramu. Przepraszamy.");
        this.props.trashesFetched({});
        this.props.closestTrashesFetched([]);
      }
    });
  };

  render() {
    return (
      <View style={styles.scheduleContainer}>
        <Header />
        <SelectedLocation />
        <ScrollView style={styles.scheduleWrapper}>
          <Text style={styles.titleSchedule}>Harmonogram odbioru odpadów</Text>
          <Text style={styles.dateSchedule}>{this.state.schedule}</Text>

          {this.props.closestTrashes.length ? (
            this.props.closestTrashes.map((trash) => (
              <View style={styles.simpleDate} key={trash.name}>
                <View style={[styles.sign, styles[trash.name]]}></View>
                <Text style={[styles.singleData, styles.white]}> {TRASHES[trash.name]}</Text>
                <Text style={[styles.singleDate, styles.white]}> {trash.day && trash.month ? validationDate(trash) : "n/a"} </Text>
              </View>
            ))
          ) : (
            <Text style={styles.loaderText}>Ładowanie...</Text>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scheduleContainer: {
    alignItems: "center",
    flex: 1,
    height: "100%",
  },

  scheduleWrapper: {
    marginTop: 30,
    width: "100%",
  },

  titleSchedule: {
    fontSize: 22,
    marginBottom: 5,
    textAlign: "center",
  },

  dateSchedule: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },

  loaderText: {
    fontSize: 16,
    textAlign: "center",
  },

  singleData: {
    width: "70%",
    paddingLeft: 8,
    fontSize: 16,
  },

  singleDate: {
    width: "20%",
  },

  simpleDate: {
    alignSelf: "stretch",
    flexDirection: "row",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 40,
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  sign: {
    paddingLeft: 10,
    width: 16,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    height: 16,
    marginTop: 2,
  },

  mixedTrash: {
    backgroundColor: "#232323",
  },

  plasticTrash: {
    backgroundColor: "#fffe35",
  },

  maculatureTrash: {
    backgroundColor: "#1974e9",
  },

  bioTrash: {
    backgroundColor: "#754f4f",
  },

  ashTrash: {
    backgroundColor: "#737373",
  },

  glassTrash: {
    backgroundColor: "#39b54a",
  },

  hugeTrash: {
    backgroundColor: "#ffffff",
  },
});

const mapStateToProps = (state) => {
  return {
    streetId: state.streetId,
    trashes: state.trashes,
    closestTrashes: state.closestTrashes,
  };
};
const mapDispatchToProps = {
  streetIdFetched,
  trashesFetched,
  closestTrashesFetched,
};

export default connect(mapStateToProps, mapDispatchToProps)(Schedule);
