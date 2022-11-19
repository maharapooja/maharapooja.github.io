import { StyleSheet, Text, SafeAreaView, Pressable, FlatList, View, Image, Alert } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from '../FirebaseApp';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { useIsFocused } from '@react-navigation/native';

const PetsScreen = ({navigation}) => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);
    const [usersPets, setUsersPets] = useState([]);
    const [usersCaregiving, setUsersCaregiving] = useState([]);

    const isFocused = useIsFocused();

    useEffect(()=>{
        navigation.setOptions({
            headerRight: () => (
                <View style={{flexDirection:'row'}}>
                    <Pressable onPress={ () => {
                        navigation.navigate("Settings", {userId: loggedInUser.uid});
                    }}>
                        <Ionicons name="settings-sharp" size={24} color='#335C67' style={{marginRight:15}}/>
                    </Pressable>
                    <Pressable onPress={ () => {
                        Alert.alert('Logout', 'Are you sure you want to logout?', [  
                            {text: 'NO', onPress: () => console.log('NO Pressed'), style:'cancel'},  
                            {text: 'YES', onPress: async () => {
                                try {
                                    await signOut(auth);
                                    navigation.reset({index:0, routes:[{name: 'AuthenticationNavigator'}], key:null});      
                                } catch (err) {
                                    console.log(`Logout failed: ${err.message}`);
                                }
                            }},
                        ]);
                    }}>
                    <MaterialIcons name="logout" size={24} color='#335C67' />
                </Pressable>
              </View>
            )
        })
    }, [loggedInUser, isFocused])

    useEffect(()=>{
        const listener = onAuthStateChanged(auth, (userFromFirebaseAuth) => {
        if (userFromFirebaseAuth) {
            setLoggedInUser(userFromFirebaseAuth);
        }
        else {
            setLoggedInUser(null);
        }
        })
        return listener
    }, [])

    useEffect(()=>{
        getUserPets();
        getUserCaregiving();
    }, [loggedInUser, isFocused])

    const getUserPets = async () => {
        var index = 0;
        var pets = [];
        try {
            const docRef = query(collection(db, "pets"), where("owner", "==", loggedInUser.uid));
            const querySnapshot = await getDocs(docRef);
            const documents = querySnapshot.docs;
            while (index<documents.length) {
                pets.push({key:documents[index].id, owner:'You', value:documents[index]});
                index = index+1;
            }
            setUsersPets(pets);
        } catch (err) {
            console.log("Getting User's Pets: " + err.message);        
        }
    }

    const getUserCaregiving = async () => {
        var index = 0;
        var pets = [];
        try {
            const caregivingDocRef = query(collection(db, "caregiving"), where("user", "==", loggedInUser.uid));
            const caregivingQuerySnapshot = await getDocs(caregivingDocRef);
            const caregivingDocuments = caregivingQuerySnapshot.docs;

            while (index<caregivingDocuments.length) {
                try {
                    const petDocRef = doc(db, "pets", caregivingDocuments[index].data().pet);
                    const petQuerySnapshot = await getDoc(petDocRef);

                    try {
                        const userProfileDocRef = query(collection(db, "profiles"), where("userId", "==", petQuerySnapshot.data().owner));
                        const userProfileQuerySnapshot = await getDocs(userProfileDocRef);
                        const userProfileDocument = userProfileQuerySnapshot.docs;

                        pets.push({key: petQuerySnapshot.id,
                                owner:userProfileDocument[0].data().first_name+" "+userProfileDocument[0].data().last_name,
                                value: petQuerySnapshot});
                    } catch(err) {
                        console.log("Getting User's Caregiving Profile: " + err.message);
                    }
                } catch(err) {
                    console.log("Getting User's Caregiving Pet: " + err.message);
                }
                index = index + 1;
            }
            setUsersCaregiving(pets);
        } catch (err) {
            console.log("Getting User's Caregiving: " + err.message);
        }
    }

    useEffect(()=>{
        setFilteredDataSource(usersPets.concat(usersCaregiving));
    }, [usersPets, usersCaregiving])

    const onChangeSearch = query => setSearchQuery(query);

    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
          const newData = masterDataSource.filter(function (item) {
            const itemData = item.first_name
              ? item.first_name.toUpperCase()
              : ''.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
          });
          setFilteredDataSource(newData);
          setSearch(text);
        } else {
          setFilteredDataSource(masterDataSource);
          setSearch(text);
        }
    };


    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        var month = 0;
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
            month = birthDate.getMonth();
        }
        else {
            month = m
        }
        if (age===0) {
            return `${month} months`;
        }
        else {
            return `${age} years ${month} months`;
        }
    }

    const renderItem = ( {item} ) => (
        <Pressable onPress={ () => {
            navigation.navigate("PetProfileScreen", {pet:item.key});
        }
        }>
            <View style={styles.pet}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View style={styles.imgView}>
                        <Image source={require('../assets/paw.png')} style={styles.img}/>
                    </View>
                    <View>
                        <View style={{flexDirection:'row', alignItems:'baseline'}}>
                            <Text style={{marginLeft:20, fontSize:18}}>{item.value.data().name}</Text>
                            <Text style={{fontSize:14, color:'gray'}}> {getAge(item.value.data().birthday)}</Text>
                        </View>
                        <Text style={{marginLeft:20, color:'dimgray'}}>Owner:
                            <Text style={{color:'gray'}}> {item.owner}</Text>
                        </Text>
                    </View>
                </View>
                <AntDesign name="right" size={20} color='#335C67' style={{marginRight:22}}/>
            </View>
        </Pressable>
    );

    const ItemDivider = () => {
        return (
            <View style={{height: 1, width: "100%", backgroundColor: "#cccccc"}}/>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View  style={{marginTop:10, marginBottom:10}}> 
            <Searchbar placeholder="Search" onChangeText={(text) => searchFilterFunction(text)} value={search} style={styles.searchBar} />
                <Pressable onPress={ () => {
                    navigation.navigate("CreatePetProfile", {user:loggedInUser.uid})
                }}>
                    <Text style={styles.pressableStyle}>ADD PET</Text>
                </Pressable>

            </View>
            <FlatList
                data={filteredDataSource}
                keyExtractor={item => item.key}
                renderItem={renderItem}
                ItemSeparatorComponent={ItemDivider}
            />
        </SafeAreaView>
    );
}
  
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pet: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        marginBottom: 15,
        alignItems: 'center'
    },
    img: {
        width:'100%', 
        height:undefined, 
        aspectRatio:1
    },
    imgView: {
        width: 60,
        height: 60,
        borderRadius: '100%',
        borderWidth: 1,
        borderColor: 'black',
        alignSelf: 'center',
        marginLeft: 22,
        padding: 8
    },
    pressableStyle: {
        alignSelf: 'center',
        textAlign: 'center',
        backgroundColor: '#335C67',
        color: '#fff',
        // backgroundColor: '#ffffff',
        // color: '#335C67',
        // borderColor: '#335C67',
        // borderStyle: 'solid',
        // borderWidth: 1,
        marginLeft: 22,
        marginRight: 22,
        marginTop: 22,
        fontSize: 15,
        padding: 15,
        width: '90%',
        fontWeight: 'bold'
    },
    searchBar: {
        width: '90%',
        alignSelf: 'center',
        elevation: 1
    }
});

export default PetsScreen;
