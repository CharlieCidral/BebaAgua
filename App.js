import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, Text, Button, TextInput, SVG } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory';
import {AsyncStorage} from 'react-native';

export default class PrimeiroProjeto extends Component {

	constructor(props) {
		super(props);
		this.state = {
			peso: '',
			meta:2000,
			consumido:0,
			status:'Ruim',
			pct:0,
			dailyConsumption: [],
		};

		this.calcularMeta = this.calcularMeta.bind(this);
		this.addCopo = this.addCopo.bind(this);
		this.atualizar = this.atualizar.bind(this);
		this.checkNewDay = this.checkNewDay.bind(this);
	}

	async componentDidMount() {
  try {
    if (AsyncStorage) {
      const today = new Date().toLocaleDateString();
      const savedData = await AsyncStorage.getItem(today);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.setState({ dailyConsumption: parsedData });
      }
    } else {
      console.error('AsyncStorage is not available.');
    }
  } catch (error) {
    console.error('Error checking new day:', error);
  }
}

	async checkNewDay() {
		try {
			const today = new Date().toLocaleDateString();
			const savedData = await AsyncStorage.getItem(today);
	
			if (savedData) {
				const parsedData = JSON.parse(savedData);
				this.setState({ dailyConsumption: parsedData });
			}
		} catch (error) {
			console.error('Error checking new day:', error);
		}
	}

	async updateDailyConsumption() {
    try {
      const today = new Date().toLocaleDateString();
      await AsyncStorage.setItem(today, JSON.stringify(this.state.dailyConsumption));
    } catch (error) {
      console.error('Error updating daily consumption:', error);
    }
  }

	calcularMeta() {
    // Calculate the goal based on the entered weight (in kg)
    const weight = parseFloat(this.state.peso);
    if (!isNaN(weight)) {
      const meta = weight * 35;
      this.setState({ meta }, () => {
        // Recalculate the percentage when the goal changes
        this.atualizar();
      });
    } else {
      // Handle invalid input
      console.error('Invalid weight input');
    }
  }

	atualizar() {
		let s = this.state;
		s.pct = Math.floor((s.consumido/s.meta)*100);

		if(s.pct >= 100) {
			s.status = "Excelente";
		} else if(s.pct >= 70) {
			s.status = "Bom";
		} else {
			s.status = "Ruim";
		}

		this.setState(s, () => this.updateDailyConsumption());
	}

	addCopo() {
		const currentDate = new Date().toLocaleDateString();
		const { dailyConsumption } = this.state;
		
		const existingEntryIndex = dailyConsumption.findIndex((entry) => entry.date === currentDate);
		if (existingEntryIndex !== -1) {
			// Update existing entry
			dailyConsumption[existingEntryIndex].value += 200;
		} else {
			// Create a new entry
			dailyConsumption.push({ date: currentDate, value: 200 });
		}

		const newConsumed = this.state.consumido + 200;
		this.setState({ consumido: newConsumed, dailyConsumption }, () => {
			this.atualizar();
		});

	}


	render() {
		return (
			<View style={styles.body}>
				<ImageBackground source={require('./images/waterbg.png')} style={styles.bgimage}>
					<View>

						<View style={styles.infoArea}>
							<View style={styles.area}>
								<Text style={styles.areaTitulo}>Meta</Text>
								<Text style={styles.areaDado}>{this.state.meta}ml</Text>
							</View>
							<View style={styles.area}>
								<Text style={styles.areaTitulo}>Consumido</Text>
								<Text style={styles.areaDado}>{this.state.consumido}ml</Text>
							</View>
							<View style={styles.area}>
								<Text style={styles.areaTitulo}>Status</Text>
								<Text style={styles.areaDado}>{this.state.status}</Text>
							</View>
						</View>

						<View style={styles.pctArea}>
							<Text style={styles.pctText}>{this.state.pct}%</Text>
						</View>

						<View style={styles.btnArea}>
							<Button title="Beber 200ml" onPress={this.addCopo} />
						</View>
						<View style={styles.calc}>
							<TextInput
								style={styles.input}
								placeholder="Digite seu peso (kg)"
								keyboardType="numeric"
								onChangeText={(text) => this.setState({ peso: text })}
								value={this.state.peso}
							/>
						</View>
						<View style={styles.calMeta}>
							{/* Button to calculate goal */}
							<Button title="Calcular Meta" onPress={() => this.calcularMeta()} />
						</View>
						<View style={styles.chart}>
						<VictoryChart 
								width={350}
								height={220}
								domain={{ y: [0, this.state.meta] }}
								overflow='none'
								position='absolute'
								domainPadding={20}
							>
							<VictoryAxis // X-axis
								tickValues={this.state.dailyConsumption.map((item) => item.value)}
								tickFormat={this.state.dailyConsumption.map((item) => item.date)}
							/>
              <VictoryAxis // Y-axis
                dependentAxis
                tickFormat={(t) => `${t}ml`}
              />
              <VictoryBar // Bar chart data
                data={this.state.dailyConsumption}
                x="date"
                y="value"
              />
            </VictoryChart>
						</View>
					</View>

				</ImageBackground>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	body:{
		flex:1,
		paddingTop:20
	},
	bgimage:{
		flex:1,
		width:null
	},
	infoArea:{
		flex:1,
		flexDirection:'row',
		marginTop:70
	},
	area:{
		flex:1,
		alignItems:'center'
	},
	areaTitulo:{
		color:'#45b2fc'
	},
	areaDado:{
		color:'#2b4274',
		fontSize:15,
		fontWeight:'bold'
	},
	pctArea:{
		marginTop:170,
		alignItems:'center'
	},
	pctText:{
		fontSize:70,
		color:'#FFFFFF',
		backgroundColor:'transparent'
	},
	btnArea:{
		marginTop:30,
		alignItems:'center'
	},
	input:{
		padding:18,
		marginTop:30,
		width:220,
		backgroundColor:'#e8edf2',
		height:28,
		fontSize:18,
		borderRadius: 8,
	},
	calc:{
		alignItems: 'center',
		justifyContent:'center',
	},
	calMeta: {
		alignItems: 'center',
		justifyContent:'center',
		padding:18,
		marginTop:30,
		height:28,
		fontSize:18,
		borderRadius: 8,
	},
	chart :{
		height:220,
		alignItems: 'strech',
		justifyContent:'center',
		overflow: 'none',
	}
});
