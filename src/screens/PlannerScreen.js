import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Dimensions, Platform
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Flag, Navigation, Rocket, Search, CreditCard, CheckCircle, ScrollText } from 'lucide-react-native';
import { usePlannerStore } from '../store/plannerStore';
import { useWalletStore } from '../store/walletStore';

// OSRM walking directions logic
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getWalkingDirections = async (lon1, lat1, lon2, lat2) => {
    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?steps=true`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            const steps = data.routes[0].legs[0].steps;
            let instructions = [];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const dist = Math.round(step.distance);
                if (dist < 5 && step.maneuver.type !== "arrive") continue;

                let action = "camina";
                if (step.maneuver.type === "turn") {
                    if (step.maneuver.modifier && step.maneuver.modifier.includes("right")) action = "gira a la derecha y camina";
                    else if (step.maneuver.modifier && step.maneuver.modifier.includes("left")) action = "gira a la izquierda y camina";
                } else if (step.maneuver.type === "depart") {
                    action = "dirígete";
                }

                if (step.name) {
                    instructions.push(`${action} ${dist}m por ${step.name}`);
                } else {
                    instructions.push(`${action} ${dist}m`);
                }

                if (instructions.length >= 2) break; // max 2 steps per segment
            }
            if (instructions.length > 0) {
                const joined = instructions.join(", luego ");
                return {
                    text: joined.charAt(0).toUpperCase() + joined.slice(1),
                    duration: data.routes[0].duration,
                    distance: data.routes[0].distance
                };
            }
        }
    } catch (e) {
        console.error("OSRM Error:", e);
    }
    const fallbackDist = getDistance(lat1, lon1, lat2, lon2);
    const fallbackDuration = fallbackDist / 1.4;
    return {
        text: `Camina ${fallbackDist.toFixed(0)}m`,
        duration: fallbackDuration,
        distance: fallbackDist
    };
};

export const PlannerScreen = () => {
    const { planTrip, history, fetchHistory, loading: storeLoading, roads, stations, fetchMapData } = usePlannerStore();
    const { balance, fetchBalance } = useWalletStore();

    const mapRef = useRef(null);

    const [origin, setOrigin] = useState({ lat: null, lng: null, text: "" });
    const [dest, setDest] = useState({ lat: null, lng: null, text: "" });
    const [clickMode, setClickMode] = useState("ORIGIN");

    const [originQuery, setOriginQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");

    const [loading, setLoading] = useState(false);
    const [searchingOrig, setSearchingOrig] = useState(false);
    const [searchingDest, setSearchingDest] = useState(false);
    const [tourResult, setTourResult] = useState(null);
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        fetchBalance();
        fetchHistory();
        fetchMapData();
    }, []);

    const handleMapPress = (e) => {
        const coords = e.nativeEvent.coordinate;
        if (clickMode === "ORIGIN") {
            setOrigin({ lat: coords.latitude, lng: coords.longitude, text: "Ubicación fijada en mapa" });
            setOriginQuery("Ubicación fijada en mapa");
            setClickMode("DESTINATION");
            Alert.alert("Origen", "Origen seleccionado.");
        } else {
            setDest({ lat: coords.latitude, lng: coords.longitude, text: "Ubicación fijada en mapa" });
            setDestQuery("Ubicación fijada en mapa");
            setClickMode("ORIGIN");
            Alert.alert("Destino", "Destino seleccionado.");
        }
    };

    const handleStationPress = (lat, lng, name) => {
        if (clickMode === "ORIGIN") {
            setOrigin({ lat, lng, text: `Estación: ${name}` });
            setOriginQuery(`Estación: ${name}`);
            setClickMode("DESTINATION");
            Alert.alert("Origen", name);
        } else {
            setDest({ lat, lng, text: `Estación: ${name}` });
            setDestQuery(`Estación: ${name}`);
            setClickMode("ORIGIN");
            Alert.alert("Destino", name);
        }
    };

    const geocode = async (query, isOrigin) => {
        if (!query) return;
        if (isOrigin) setSearchingOrig(true);
        else setSearchingDest(true);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=gt&format=json&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), text: data[0].display_name };
                if (isOrigin) {
                    setOrigin(result);
                    mapRef.current?.animateToRegion({ latitude: result.lat, longitude: result.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                } else {
                    setDest(result);
                    mapRef.current?.animateToRegion({ latitude: result.lat, longitude: result.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                }
            } else {
                Alert.alert("Error", "No se encontró esa ubicación.");
            }
        } catch (error) {
            Alert.alert("Error", "Buscando la ubicación.");
        } finally {
            if (isOrigin) setSearchingOrig(false);
            else setSearchingDest(false);
        }
    };

    const handleGetCurrentLocation = async () => {
        setSearchingOrig(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación.');
                setSearchingOrig(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
                const data = await res.json();
                const address = data.display_name || "Mi Ubicación Actual";

                setOrigin({ lat: latitude, lng: longitude, text: address });
                setOriginQuery("Mi Ubicación Actual");
            } catch (error) {
                setOrigin({ lat: latitude, lng: longitude, text: "Mi Ubicación Actual" });
                setOriginQuery("Mi Ubicación Actual");
            }
            mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        } catch (error) {
            Alert.alert("Error", "No se pudo obtener la ubicación.");
        } finally {
            setSearchingOrig(false);
        }
    };

    const calculateSmartRoute = async () => {
        let nearestOrigStation = null;
        let minOrigDist = Infinity;

        stations.forEach(st => {
            const dist = getDistance(origin.lat, origin.lng, st.location.coordinates[1], st.location.coordinates[0]);
            if (dist < minOrigDist) {
                minOrigDist = dist;
                nearestOrigStation = st;
            }
        });

        let nearestDestStation = null;
        let minDestDist = Infinity;

        stations.forEach(st => {
            const dist = getDistance(dest.lat, dest.lng, st.location.coordinates[1], st.location.coordinates[0]);
            if (dist < minDestDist) {
                minDestDist = dist;
                nearestDestStation = st;
            }
        });

        if (!nearestOrigStation || !nearestDestStation) {
            return { error: "No hay estaciones disponibles." };
        }

        let bestRoad = null;
        for (const road of roads) {
            const hasOrig = road.stations.some(s => s === nearestOrigStation._id || s._id === nearestOrigStation._id);
            const hasDest = road.stations.some(s => s === nearestDestStation._id || s._id === nearestDestStation._id);

            if (hasOrig && hasDest) {
                bestRoad = road;
                break;
            }
        }

        const walkToOrigData = await getWalkingDirections(origin.lng, origin.lat, nearestOrigStation.location.coordinates[0], nearestOrigStation.location.coordinates[1]);
        const walkToDestData = await getWalkingDirections(nearestDestStation.location.coordinates[0], nearestDestStation.location.coordinates[1], dest.lng, dest.lat);

        const busDistance = getDistance(nearestOrigStation.location.coordinates[1], nearestOrigStation.location.coordinates[0], nearestDestStation.location.coordinates[1], nearestDestStation.location.coordinates[0]);
        const busDuration = busDistance / 4.16;

        const totalDurationSeconds = walkToOrigData.duration + busDuration + walkToDestData.duration + 300;
        const estimatedTimeMin = Math.ceil(totalDurationSeconds / 60);

        const totalDistanceMeters = walkToOrigData.distance + busDistance + walkToDestData.distance;

        if (bestRoad) {
            let systemType = "TRANSMETRO";
            if (bestRoad.typeRoad === "EXPRESS") systemType = "TRANSURBANO";
            if (bestRoad.typeRoad === "RELEVOS") systemType = "TUBUS";

            const itinerary = `1. ${walkToOrigData.text} hacia Estación ${nearestOrigStation.name}.\n2. Aborda Ruta ${bestRoad.name} (${bestRoad.routeCode}).\n3. Baja en Estación ${nearestDestStation.name}.\n4. ${walkToDestData.text} hacia tu destino.`;

            return { success: true, systemType, itinerary, routeObj: bestRoad, estimatedTimeMin, totalDistanceMeters };
        } else {
            const itinerary = `1. ${walkToOrigData.text} hacia Estación ${nearestOrigStation.name}.\n2. Toma ruta con transbordo hacia troncales.\n3. Baja en Estación ${nearestDestStation.name}.\n4. ${walkToDestData.text} hacia tu destino.`;
            return { success: true, systemType: "TRANSMETRO", itinerary, estimatedTimeMin, totalDistanceMeters };
        }
    };

    const handleCalculateOnly = async () => {
        if (!origin.lat || !dest.lat) {
            Alert.alert("Error", "Debes seleccionar un origen y un destino");
            return;
        }

        setLoading(true);

        const routePlan = await calculateSmartRoute();
        if (routePlan.error) {
            Alert.alert("Error", routePlan.error);
            setLoading(false);
            return;
        }

        const distanceMeters = getDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        const distanceKm = (distanceMeters / 1000).toFixed(2);
        const fare = routePlan.systemType === "TRANSURBANO" ? 2.00 : 1.00;

        setTourResult({
            isPaid: false,
            systemType: routePlan.systemType,
            itinerary: routePlan.itinerary,
            estimatedDistance: `${distanceKm} km`,
            chargedFare: `Q${fare.toFixed(2)}`,
            estimatedTimeMin: routePlan.estimatedTimeMin,
            totalDistanceMeters: routePlan.totalDistanceMeters
        });
        setLoading(false);
    };

    const handlePayTour = async () => {
        if (!tourResult) return;
        const res = await planTrip(
            origin.lat, origin.lng, dest.lat, dest.lng,
            tourResult.systemType, tourResult.itinerary,
            origin.text, dest.text, tourResult.estimatedTimeMin, tourResult.totalDistanceMeters
        );
        if (res.success) {
            setTourResult(prev => ({ ...prev, isPaid: true }));
            Alert.alert('Éxito', res.message || '¡Viaje pagado exitosamente!');
            if (res.warning) Alert.alert('Aviso', res.warning);
        } else {
            Alert.alert('Error', res.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Balance Banner */}
            <View style={styles.balanceBanner}>
                <View>
                    <Text style={styles.balanceLabel}>Saldo Disponible</Text>
                    <Text style={styles.balanceValue}>Q{balance !== null ? balance.toFixed(2) : '0.00'}</Text>
                </View>
                <View style={styles.courtesyBadge}>
                    <Text style={styles.courtesyText}>5 Cortesía</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Planificador Multimodal</Text>
                <Text style={styles.cardSubtitle}>Escribe o elige en el mapa.</Text>

                {/* Inputs */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <MapPin size={18} color="#10B981" />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Origen..."
                            value={originQuery}
                            onChangeText={setOriginQuery}
                            onSubmitEditing={() => geocode(originQuery, true)}
                        />
                        <TouchableOpacity style={styles.searchBtn} onPress={() => geocode(originQuery, true)}>
                            {searchingOrig ? <ActivityIndicator size="small" color="#64748B" /> : <Text style={styles.searchBtnText}>Ir</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.locBtn} onPress={handleGetCurrentLocation}>
                            <Navigation size={18} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Flag size={18} color="#EF4444" />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Destino..."
                            value={destQuery}
                            onChangeText={setDestQuery}
                            onSubmitEditing={() => geocode(destQuery, false)}
                        />
                        <TouchableOpacity style={styles.searchBtn} onPress={() => geocode(destQuery, false)}>
                            {searchingDest ? <ActivityIndicator size="small" color="#64748B" /> : <Text style={styles.searchBtnText}>Ir</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Map Mode Toggles */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, clickMode === "ORIGIN" && styles.toggleBtnActiveOrig]}
                        onPress={() => setClickMode("ORIGIN")}
                    >
                        <Text style={[styles.toggleText, clickMode === "ORIGIN" && styles.toggleTextActive]}>1. Fijar Origen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, clickMode === "DESTINATION" && styles.toggleBtnActiveDest]}
                        onPress={() => setClickMode("DESTINATION")}
                    >
                        <Text style={[styles.toggleText, clickMode === "DESTINATION" && styles.toggleTextActive]}>2. Fijar Destino</Text>
                    </TouchableOpacity>
                </View>

                {/* Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: 14.62,
                            longitude: -90.52,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                        onPress={handleMapPress}
                    >
                        {roads.map(road => {
                            if (!road.path || !road.path.coordinates || road.path.coordinates.length === 0) return null;
                            const coordinates = road.path.coordinates.map(p => ({ latitude: p[1], longitude: p[0] }));
                            const color = road.color || (road.typeRoad === 'EXPRESS' ? '#f59e0b' : road.typeRoad === 'RELEVOS' ? '#3b82f6' : '#10b981');
                            return (
                                <Polyline
                                    key={road._id}
                                    coordinates={coordinates}
                                    strokeColor={color}
                                    strokeWidth={4}
                                />
                            );
                        })}

                        {stations.map(st => {
                            if (!st.location || !st.location.coordinates) return null;
                            const lng = st.location.coordinates[0];
                            const lat = st.location.coordinates[1];
                            return (
                                <Marker
                                    key={st._id}
                                    coordinate={{ latitude: lat, longitude: lng }}
                                    pinColor="blue"
                                    title={st.name}
                                    onCalloutPress={() => handleStationPress(lat, lng, st.name)}
                                />
                            );
                        })}

                        {origin.lat && origin.lng && (
                            <Marker coordinate={{ latitude: origin.lat, longitude: origin.lng }} pinColor="green" title="Origen" />
                        )}
                        {dest.lat && dest.lng && (
                            <Marker coordinate={{ latitude: dest.lat, longitude: dest.lng }} pinColor="red" title="Destino" />
                        )}
                    </MapView>
                </View>

                <TouchableOpacity
                    style={[styles.calcBtn, loading && styles.btnDisabled]}
                    onPress={handleCalculateOnly}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <View style={styles.btnContent}>
                            <Rocket size={20} color="#FFF" />
                            <Text style={styles.calcBtnText}>Armar mi Ruta</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Tour Result */}
            {tourResult && (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultTitle}>Ruta Sugerida</Text>
                        <View style={styles.badge}><Text style={styles.badgeText}>{tourResult.systemType}</Text></View>
                    </View>
                    <Text style={styles.resultItinerary}>{tourResult.itinerary}</Text>

                    <View style={styles.resultGrid}>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultItemLabel}>Tiempo</Text>
                            <Text style={styles.resultItemVal}>{tourResult.estimatedTimeMin} min</Text>
                        </View>
                        <View style={[styles.resultItem, styles.resultItemMiddle]}>
                            <Text style={styles.resultItemLabel}>Distancia</Text>
                            <Text style={styles.resultItemVal}>{tourResult.estimatedDistance}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultItemLabel}>Tarifa</Text>
                            <Text style={styles.resultItemValText}>{tourResult.chargedFare}</Text>
                        </View>
                    </View>

                    {!tourResult.isPaid ? (
                        <TouchableOpacity
                            style={[styles.payBtn, storeLoading && styles.btnDisabled]}
                            onPress={handlePayTour}
                            disabled={storeLoading}
                        >
                            {storeLoading ? <ActivityIndicator color="#FFF" /> : (
                                <View style={styles.btnContent}>
                                    <CreditCard size={18} color="#FFF" />
                                    <Text style={styles.payBtnText}>Pagar Viaje Ahora</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.paidBadge}>
                            <CheckCircle size={18} color="#166534" />
                            <Text style={styles.paidText}>Viaje Pagado</Text>
                        </View>
                    )}
                </View>
            )}

            {/* History */}
            <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                    <ScrollText size={18} color="#1801A9" />
                    <Text style={styles.historyTitle}>Historial de Viajes</Text>
                </View>
                {history.length === 0 ? (
                    <Text style={styles.emptyText}>Sin viajes recientes.</Text>
                ) : (
                    (showAllHistory ? history : history.slice(0, 3)).map((tour, idx) => (
                        <View key={tour._id || idx} style={styles.historyCard}>
                            <View style={styles.historyTop}>
                                <View style={styles.hBadge}><Text style={styles.hBadgeText}>{tour.systemType}</Text></View>
                                <Text style={styles.historyFare}>-Q{tour.tarifaCobrada?.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.historyLocations}>
                                <Text style={{ color: '#1801A9', fontWeight: 'bold' }}>De:</Text> {tour.originName || "..."}{'\n'}
                                <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>A:</Text> {tour.destName || "..."}
                            </Text>
                            <View style={styles.historyBottom}>
                                <Text style={styles.historyStats}>{(tour.distanciaMetros / 1000).toFixed(1)} km - {tour.tiempoEstimadoMinutos} min</Text>
                                <Text style={styles.historyStats}>{new Date(tour.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    ))
                )}
                {!showAllHistory && history.length > 3 && (
                    <TouchableOpacity onPress={() => setShowAllHistory(true)} style={styles.showMoreBtn}>
                        <Text style={styles.showMoreText}>Ver todos ({history.length})</Text>
                    </TouchableOpacity>
                )}
                {showAllHistory && history.length > 3 && (
                    <TouchableOpacity onPress={() => setShowAllHistory(false)} style={styles.showMoreBtn}>
                        <Text style={styles.showMoreText}>Ocultar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 16 },
    balanceBanner: { backgroundColor: '#1801A9', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    balanceLabel: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
    balanceValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
    courtesyBadge: { backgroundColor: '#4CB500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    courtesyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1801A9', marginTop: 16, marginHorizontal: 16 },
    cardSubtitle: { fontSize: 12, color: '#64748B', marginHorizontal: 16, marginBottom: 12 },
    inputContainer: { paddingHorizontal: 16, gap: 10, marginBottom: 12 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingLeft: 12, overflow: 'hidden' },
    textInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#0F172A' },
    searchBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center' },
    searchBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
    locBtn: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center' },
    toggleRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
    toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: '#F1F5F9' },
    toggleBtnActiveOrig: { backgroundColor: '#10B981' },
    toggleBtnActiveDest: { backgroundColor: '#EF4444' },
    toggleText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    toggleTextActive: { color: '#FFFFFF' },
    mapContainer: { height: 350, backgroundColor: '#E2E8F0' },
    map: { ...StyleSheet.absoluteFillObject },
    calcBtn: { backgroundColor: '#1801A9', paddingVertical: 14, alignItems: 'center', margin: 16, borderRadius: 12 },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    calcBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
    btnDisabled: { opacity: 0.6 },
    resultCard: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#86EFAC' },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    resultTitle: { fontSize: 14, fontWeight: '900', color: '#166534', textTransform: 'uppercase' },
    badge: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    resultItinerary: { fontSize: 13, fontWeight: '600', color: '#15803D', marginBottom: 14, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#10B981' },
    resultGrid: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    resultItem: { flex: 1, alignItems: 'center' },
    resultItemMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E2E8F0' },
    resultItemLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    resultItemVal: { fontSize: 14, fontWeight: '900', color: '#1801A9' },
    resultItemValText: { fontSize: 14, fontWeight: '900', color: '#10B981' },
    payBtn: { backgroundColor: '#10B981', paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
    payBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    paidBadge: { backgroundColor: '#DCFCE7', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#86EFAC' },
    paidText: { color: '#166534', fontSize: 14, fontWeight: '900' },
    historySection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
    historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    historyTitle: { fontSize: 16, fontWeight: '800', color: '#1801A9' },
    historyCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 8 },
    historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    hBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    hBadgeText: { color: '#1E3A8A', fontSize: 10, fontWeight: '800' },
    historyFare: { fontSize: 14, fontWeight: '900', color: '#DC2626' },
    historyLocations: { fontSize: 11, color: '#475569', marginBottom: 8, lineHeight: 16 },
    historyBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    historyStats: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
    emptyText: { color: '#94A3B8', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
    showMoreBtn: { padding: 10, alignItems: 'center' },
    showMoreText: { color: '#1801A9', fontSize: 12, fontWeight: '700' }
});
