import * as React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import CheckBox from "expo-checkbox";
import { db } from './FirebaseApp';
import { collection, addDoc} from "firebase/firestore";
import { useState } from 'react';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

const CreatePetProfile2Screen = ({navigation, route}) => {
    const [pet_specie, onSpecieChanged] = useState('');
    const [pet_breed, onBreedChanged] = useState('');
    const [coat_color, onColorChanged] = useState('');
    const [mark, onMarkChanged] = useState('');
    const [isSpayed, setSpayed] = useState(false);
    const [isIntact, setIntact] = useState(false);

    const {pet_profile} = route.params;

    const addPetPressed = async () => {
        var castration = "";
        if (isSpayed) { castration = 'Neutered' }
        else if (isIntact) { castration = 'Intact' };

        try {
            const petToInsert = {
                userId:pet_profile.userId,
                name:pet_profile.name,
                birthday:pet_profile.birthday,
                regular_clinic:pet_profile.regular_clinic,
                specie:pet_specie,
                breed:pet_breed,
                coat_color:coat_color,
                mark:mark,
                neutering:castration,
            };
            const insertedPet = await addDoc(collection(db, "pets"), petToInsert);
            navigation.reset({index:0, routes:[{name: 'PetsTabScreen'}]});
        }
        catch (err) {
            console.log(`${err.message}`);
        }
    }

    return (
        <SafeAreaView style={{flex:1, backgroundColor:'#fff', justifyContent:'space-between'}}>

            <View>
                <Text style={{marginBottom:5, marginLeft:22, marginTop:22}}>Pet Specie</Text>
                <TextInput 
                    style={styles.input}
                    placeholder=""
                    keyboardType="default"
                    autoCapitalize="none"
                    onChangeText={onSpecieChanged}
                    value={pet_specie}
                />

                <Text style={{marginBottom:5, marginLeft:22, marginTop:20}}>Pet Breed</Text>
                <TextInput 
                    style={styles.input}
                    placeholder=""
                    keyboardType="default"
                    autoCapitalize="none"
                    onChangeText={onBreedChanged}
                    value={pet_breed}
                />

                <Text style={{marginBottom:5, marginLeft:22, marginTop:20}}>Pet Coat Color</Text>
                <TextInput  
                    style={styles.input}
                    placeholder=""
                    keyboardType="default"
                    autoCapitalize="none"
                    onChangeText={onColorChanged}
                    value={coat_color}
                />

                <View style={{alignItems:'baseline', margin: 22}}>
                    <Text style={{marginBottom:15, fontSize:16}}>Neutering / Castration</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <CheckBox
                            value={isSpayed}
                            onValueChange={() => {
                                setSpayed(!isSpayed);
                                setIntact(false);
                            }}
                            color='#335C67'
                            style={{borderRadius:'100%'}}
                        />
                        <Text style={{marginLeft:5, fontSize:15}}>Spayed or Neutered</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', marginTop:10}}>
                        <CheckBox
                            value={isIntact}
                            onValueChange={() => {
                                setSpayed(false);
                                setIntact(!isIntact);
                            }}
                            color='#335C67'
                            style={{borderRadius:'100%'}}
                        />
                        <Text style={{marginLeft:5, fontSize:15}}>Intact</Text>
                    </View>
                </View>

                <Text style={{marginBottom:5, marginLeft:22}}>Pet Distinguish Mark</Text>
                <TextInput 
                    style={styles.txtInput}
                    placeholder=""
                    keyboardType="name-phone-pad"
                    autoCapitalize="none"
                    multiline={true}
                    numberOfLines={10}
                    onChangeText={onMarkChanged}
                    value={mark}
                />

            </View>
            
            <View style={{marginTop:10, marginBottom:22}}>
                <Pressable onPress={addPetPressed}>
                    <Text style={styles.deletePressable}>ADD PET</Text>
                </Pressable>
            </View>
                
        </SafeAreaView>
    );
}
  
const styles = StyleSheet.create({
    title: {
        // textAlign: 'center',
        alignSelf: 'center',
        padding: 20,
        margin: 30,
        fontWeight: 'bold',
        fontSize: '35'
    },
    input: {
        alignSelf: 'center',
        height: 45,
        width: '90%',
        borderWidth: 1,
        padding: 10,
        borderColor: '#808080',
    },
    txtInput: {
        alignSelf: 'center',
        height: 150,
        width: '90%',
        borderWidth: 1,
        padding: 10,
        borderColor: '#808080',
        textAlignVertical: 'top'
    },
    deletePressable: {
        alignSelf: 'center',
        textAlign: 'center',
        backgroundColor: '#335C67',
        color: '#ffffff',
        marginLeft: 22,
        marginRight: 22,
        marginTop: 22,
        fontSize: 18,
        padding: 15,
        width: '90%',
    },
    saveChanges: {
        // borderRadius: 5,
        // borderWidth: 1,
        flex:1, 
        alignItems:'baseline',
        alignSelf:'center'
    },
    deleteAccount: {
        // borderRadius: 5,
        // borderWidth: 1,
        //flex:1, 
        alignItems:'center',
        alignSelf:'center'
    },
    checkedOptions: {
       
        flexDirection: 'row',
        justifyContent: 'space-between',
       
        alignItems: 'center'
    }
});

export default CreatePetProfile2Screen;