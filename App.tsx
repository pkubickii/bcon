/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Platform,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
} from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
declare module 'react-native-ble-manager' {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}
type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  return (
    <View className="mt-8 px-2">
      <Text className="text-2xl text-black dark:text-white">{title}</Text>
      <Text className="mt-2 text-lg text-black dark:text-white">
        {children}
      </Text>
    </View>
  );
}
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);


function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = 'bg-slate-300 dark:bg-slate-900';
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<Peripheral[]>([
    {
      id: 'ABC123',
      name: 'MyDevice',
      rssi: 1234,
      advertising: {
        localName: 'MyDevice',
        serviceUUIDs: ['4321'],
      },
      connected: true,
    },
  ]);
  const peripherals = new Map<string, Peripheral>();

  const startScan = (): void => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          setIsScanning(true);
        })
        .catch((error: Error) => {
          console.error(error);
        });
    }
  };

  const handleGetConnectedDevices = (): void => {
    BleManager.getConnectedPeripherals([]).then((results: Peripheral[]) => {
      if (results.length === 0) {
        console.log('No connected bluetooth devices');
      } else {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnected(true);
          setBluetoothDevices(Array.from(peripherals.values()));
        }
      }
    });
  };

  const connectToPeripheral = (peripheral: Peripheral) => {
    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id).then(() => {
        peripheral.connected = false;
        setConnected(false);
        alert(`Disconnected from ${peripheral.name}`);
      });
    } else {
      BleManager.connect(peripheral.id)
        .then(() => {
          let peripheralResponse = peripherals.get(peripheral.id);
          if (peripheralResponse) {
            peripheralResponse.connected = true;
            peripherals.set(peripheral.id, peripheralResponse);
            setConnected(true);
            setBluetoothDevices(Array.from(peripherals.values()));
          }

          BleManager.createBond(peripheral.id)
            .then(() => {
              console.log('Bluetooth device paired successfully!');
              alert('Connected to ' + peripheral.name);
            })
            .catch(() => {
              console.log('failed to pair');
            });
        })
        .catch(error => console.log(error));

      /* Read current RSSI value */
      setTimeout(() => {
        BleManager.retrieveServices(peripheral.id).then(peripheralData => {
          console.log('Peripheral services:', peripheralData);
        });
      }, 900);
    }
  };

  const handleAndroidPermissions = () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (result) {
          console.debug(
            '[handleAndroidPermissions] User accepts runtime permissions android 12+',
          );
        } else {
          console.error(
            '[handleAndroidPermissions] User refuses runtime permissions android 12+',
          );
        }
      });
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(checkResult => {
        if (checkResult) {
          console.debug(
            '[handleAndroidPermissions] runtime permission Android <12 already OK',
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(requestResult => {
            if (requestResult) {
              console.debug(
                '[handleAndroidPermissions] User accepts runtime permission android <12',
              );
            } else {
              console.error(
                '[handleAndroidPermissions] User refuses runtime permission android <12',
              );
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    // turn on bluetooth if it is not on
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is turned on!');
      })
      .catch((error: Error) => {
        console.log('Error enabling bluetooth: ', error);
      });

    BleManager.start({ showAlert: false })
      .then(() => {
        console.log('BleManager initialized');
      })
      .catch((error: Error) => {
        console.log('Error starting BleManager: ', error);
      });

    handleAndroidPermissions();

    let stopListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('Scan is stopped');
        handleGetConnectedDevices();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0f172a' : '#cbd5e1'}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className={backgroundStyle}>
        <View className="items-center justify-start bg-slate-200 dark:bg-slate-700">
          <Section title="FeasyBeacon">Admin App</Section>
          <TouchableOpacity
            activeOpacity={0.3}
            onPress={startScan}
            className="bg-violet-500 border-0 text-white rounded-full h-10 items-center mx-5 my-3">
            <Text className="text-lg px-4 py-2">
              {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
            </Text>
          </TouchableOpacity>
        </View>
        {bluetoothDevices.map(device => (
          <View key={device.id}>
            <Text className="text-lg, ml-2 mb-1 text-black dark:text-white">
              Nearby Devices:
            </Text>
            <TouchableOpacity onPress={() => connectToPeripheral(device)}>
              <View className="bg-slate-400 dark:bg-slate-700 rounded-5 py-5 mx-10 px-10">
                <Text className="text-xl capitalize text-white">
                  {device.name}
                </Text>
                <View className="bg-slate-500 dark:bg-slate-900 flex-row justify-between items-center">
                  <Text className="text-sm color-white">
                    RSSI: {device.rssi}
                  </Text>
                  <Text className="text-sm text-white">ID: {device.id}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
