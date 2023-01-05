import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Request from "../api/Request";
import { connect } from "react-redux";
import { streetIdFetched, newsFetched, notifAcceptFetched, trashesFetched, scheduleDatesFetched } from "../actions";
import { notifScheduling } from "../helpers/notifScheduling";

class Information extends React.Component {
  constructor() {
    super();
    this.state = {
      news: [],
      counterKey: 0,
      futureDates: [],
    };
  }

  componentDidMount() {
    Request.getNews(this.props.streetId[0], async (response) => {
      const news = response.notyfications.filter(
        (value, index, self) => index === self.findIndex((t) => t.place === value.place && t.name === value.name)
      );
      await this.props.newsFetched(news.reverse());
    });

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

        this.props.notifAccept[0] == "Powiadomienia" ? this.GetClosestDates() : null;
      } catch (err) {
        console.warn(err);
        this.props.trashesFetched({});
        this.props.closestTrashesFetched([]);
      }
    });
  }

  GetClosestDates = async () => {
    const now = new Date();
    let currentDate = [];
    let counterTrash = 0;

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
      counterTrash++;
    });

    await this.props.scheduleDatesFetched(this.state.futureDates);
    notifScheduling(this.props.scheduleDates);
  };

  render() {
    return (
      <View style={styles.informationWrapper}>
        <Text style={styles.informationTitle}>Komunikaty</Text>
        {this.props.news.map((singleNews) => (
          <View style={styles.information} key={singleNews.id}>
            <Text style={styles.dateAlert}>{singleNews.date.split(/(\s+)/)[0]}</Text>
            <Text style={styles.titleAlert}>{singleNews.title}</Text>
            <Text>{singleNews.message}</Text>
          </View>
        ))}
        {this.props.news.length ? null : <Text style={styles.notMatch}>Na ten moment nie ma żadnych nowych powiadomień.</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  informationWrapper: {
    marginTop: 30,
    marginBottom: 50,
    paddingRight: 20,
    paddingLeft: 20,
  },

  informationTitle: {
    fontSize: 24,
    paddingBottom: 10,
  },

  information: {
    borderColor: "#c3c3c3",
    borderWidth: 2,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 4,
    marginTop: 10,
  },

  dateAlert: {
    textAlign: "right",
  },

  titleAlert: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 20,
  },

  notMatch: {
    marginTop: 30,
  },
});

const mapStateToProps = (state) => {
  return {
    streetId: state.streetId,
    news: state.news,
    notifAccept: state.notifAccept,
    trashes: state.trashes,
    scheduleDates: state.scheduleDates,
  };
};

const mapDispatchToProps = {
  streetIdFetched,
  newsFetched,
  notifAcceptFetched,
  trashesFetched,
  scheduleDatesFetched,
};

export default connect(mapStateToProps, mapDispatchToProps)(Information);
