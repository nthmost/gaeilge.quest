/**
 * @file directions-data.js
 * Data for Irish direction words learning activities
 */

const DirectionsData = (function() {
    // Direction word reference data
    const directionWords = {
        // Up/Down movement
        suas: { 
            meaning: "up (movement upward)", 
            explanation: "Use 'suas' when something or someone is moving upward, away from the ground or a lower position."
        },
        síos: { 
            meaning: "down (movement downward)", 
            explanation: "Use 'síos' when something or someone is moving downward, toward the ground or a lower position."
        },
        anuas: { 
            meaning: "down (from above toward speaker)", 
            explanation: "Use 'anuas' when something is coming down from above toward the speaker's position."
        },
        aníos: { 
            meaning: "up (from below toward speaker)", 
            explanation: "Use 'aníos' when something is coming up from below toward the speaker's position."
        },
        
        // In/Out movement
        amach: { 
            meaning: "out (away from enclosed space)", 
            explanation: "Use 'amach' when moving out from an enclosed space to an open area."
        },
        isteach: { 
            meaning: "in (into an enclosed space)", 
            explanation: "Use 'isteach' when moving into an enclosed space from outside."
        },
        
        // Directions
        siar: { 
            meaning: "westward/backward", 
            explanation: "Use 'siar' for movement westward or backward (away from the speaker)."
        },
        soir: { 
            meaning: "eastward/forward", 
            explanation: "Use 'soir' for movement eastward or forward (away from the speaker)."
        },
        ó thuaidh: { 
            meaning: "northward", 
            explanation: "Use 'ó thuaidh' for movement northward."
        },
        ó dheas: { 
            meaning: "southward", 
            explanation: "Use 'ó dheas' for movement southward."
        },
        
        // Towards/Away
        chugam: { 
            meaning: "towards me", 
            explanation: "Use 'chugam' for movement directed toward the speaker."
        },
        uaim: { 
            meaning: "away from me", 
            explanation: "Use 'uaim' for movement directed away from the speaker."
        },
        
        // Position relative to speaker
        thuas: { 
            meaning: "up there (static position above)", 
            explanation: "Use 'thuas' to indicate a static position that is above the speaker."
        },
        thíos: { 
            meaning: "down there (static position below)", 
            explanation: "Use 'thíos' to indicate a static position that is below the speaker."
        },
        
        // Around/Across
        timpeall: { 
            meaning: "around", 
            explanation: "Use 'timpeall' for movement that encircles or goes around something."
        },
        trasna: { 
            meaning: "across", 
            explanation: "Use 'trasna' for movement that crosses from one side to another."
        }
    };

    // Level-specific word sets
    const levelWords = {
        beginner: ['suas', 'síos', 'amach', 'isteach'],
        intermediate: ['suas', 'síos', 'anuas', 'aníos', 'amach', 'isteach', 'thuas', 'thíos'],
        advanced: Object.keys(directionWords)
    };

    // Scenario data organized by category and level
    const scenarios = {
        weather: {
            beginner: [
                {
                    id: 'weather_beginner_1',
                    title: 'Rain Falling',
                    image: '/assets/images/directions/rain_falling.jpg',
                    description: 'It\'s raining heavily. The rain is falling from the clouds above.',
                    exercises: [
                        {
                            sentence: 'Titeann an bháisteach ____ ón spéir.',
                            blanks: [
                                {
                                    id: 'weather_beginner_1_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'síos',
                                    explanation: "We use 'síos' here because the rain is falling downward from the sky. This is a movement in a downward direction away from its source."
                                }
                            ],
                            translation: 'The rain falls down from the sky.'
                        }
                    ]
                },
                {
                    id: 'weather_beginner_2',
                    title: 'Steam Rising',
                    image: '/assets/images/directions/steam_rising.jpg',
                    description: 'Steam is rising from a hot cup of tea on a cold morning.',
                    exercises: [
                        {
                            sentence: 'Téann an gal ____ ón gcupán tae.',
                            blanks: [
                                {
                                    id: 'weather_beginner_2_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'suas',
                                    explanation: "We use 'suas' here because the steam is rising upward from the tea. This is a movement in an upward direction away from its source."
                                }
                            ],
                            translation: 'The steam goes up from the cup of tea.'
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'weather_intermediate_1',
                    title: 'Leaves Falling in Autumn',
                    image: '/assets/images/directions/leaves_falling.jpg',
                    description: 'It\'s autumn and the leaves are falling from the trees. You\'re standing under a tree watching the leaves fall toward you.',
                    exercises: [
                        {
                            sentence: 'Titeann na duilleoga ____ sa bhfómhar.',
                            blanks: [
                                {
                                    id: 'weather_intermediate_1_blank_1',
                                    options: ['suas', 'síos', 'anuas', 'aníos', 'amach', 'isteach'],
                                    correct: 'anuas',
                                    explanation: "We use 'anuas' here because the leaves are falling down from above toward the speaker's position. This differs from 'síos' which would be used if the speaker was observing the downward movement from a distance."
                                }
                            ],
                            translation: 'The leaves fall down (toward us) in autumn.'
                        }
                    ]
                },
                {
                    id: 'weather_intermediate_2',
                    title: 'Fog Clearing',
                    image: '/assets/images/directions/fog_clearing.jpg',
                    description: 'The morning fog is starting to clear as the sun warms the valley.',
                    exercises: [
                        {
                            sentence: 'Téann an ceo ____ nuair a éiríonn an ghrian.',
                            blanks: [
                                {
                                    id: 'weather_intermediate_2_blank_1',
                                    options: ['suas', 'síos', 'anuas', 'aníos', 'amach', 'isteach'],
                                    correct: 'suas',
                                    explanation: "We use 'suas' here because the fog is rising upward as it clears. This is a movement in an upward direction."
                                }
                            ],
                            translation: 'The fog goes up when the sun rises.'
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'weather_advanced_1',
                    title: 'Storm Coming',
                    image: '/assets/images/directions/storm_approaching.jpg',
                    description: 'A powerful storm is approaching from the west. You can see dark clouds moving across the sky toward your location.',
                    exercises: [
                        {
                            sentence: 'Tá an stoirm ag teacht ____ ón iarthar.',
                            blanks: [
                                {
                                    id: 'weather_advanced_1_blank_1',
                                    options: ['siar', 'soir', 'anuas', 'aníos', 'chugam', 'uaim'],
                                    correct: 'soir',
                                    explanation: "We use 'soir' here because the storm is coming from the west (iarthar) and moving eastward (soir). Remember that 'soir' means movement eastward."
                                }
                            ],
                            translation: 'The storm is coming eastward from the west.'
                        },
                        {
                            sentence: 'Bogann na scamaill dhorcha ____ sa spéir.',
                            blanks: [
                                {
                                    id: 'weather_advanced_1_blank_2',
                                    options: ['trasna', 'timpeall', 'thuas', 'thíos', 'chugam'],
                                    correct: 'trasna',
                                    explanation: "We use 'trasna' here because the clouds are moving across the sky, from one side to another."
                                }
                            ],
                            translation: 'The dark clouds move across the sky.'
                        }
                    ]
                },
                {
                    id: 'weather_advanced_2',
                    title: 'Snow Melting in Spring',
                    image: '/assets/images/directions/snow_melting.jpg',
                    description: 'It\'s spring and the snow is melting on the mountains. Streams of water are flowing down toward the valley where you stand.',
                    exercises: [
                        {
                            sentence: 'Ritheann an t-uisce ____ ó na sléibhte.',
                            blanks: [
                                {
                                    id: 'weather_advanced_2_blank_1',
                                    options: ['anuas', 'aníos', 'síos', 'suas', 'siar', 'soir'],
                                    correct: 'anuas',
                                    explanation: "We use 'anuas' here because the water is flowing down from the mountains toward the speaker's position in the valley."
                                }
                            ],
                            translation: 'The water runs down (toward us) from the mountains.'
                        },
                        {
                            sentence: 'Tá an sneachta ____ ar na sléibhte ag leá.',
                            blanks: [
                                {
                                    id: 'weather_advanced_2_blank_2',
                                    options: ['thuas', 'thíos', 'suas', 'síos', 'trasna'],
                                    correct: 'thuas',
                                    explanation: "We use 'thuas' here because the snow is in a static position above the speaker (on the mountains). This describes location rather than movement."
                                }
                            ],
                            translation: 'The snow up there on the mountains is melting.'
                        }
                    ]
                }
            ]
        },
        home: {
            beginner: [
                {
                    id: 'home_beginner_1',
                    title: 'Going Upstairs',
                    image: '/assets/images/directions/going_upstairs.jpg',
                    description: 'You\'re walking up the stairs to the second floor of your house.',
                    exercises: [
                        {
                            sentence: 'Táim ag dul ____ an staighre.',
                            blanks: [
                                {
                                    id: 'home_beginner_1_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'suas',
                                    explanation: "We use 'suas' here because you are moving upward on the stairs."
                                }
                            ],
                            translation: 'I am going up the stairs.'
                        }
                    ]
                },
                {
                    id: 'home_beginner_2',
                    title: 'Entering the Kitchen',
                    image: '/assets/images/directions/entering_kitchen.jpg',
                    description: 'You\'re walking from the hallway into the kitchen.',
                    exercises: [
                        {
                            sentence: 'Téim ____ sa chistin.',
                            blanks: [
                                {
                                    id: 'home_beginner_2_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'isteach',
                                    explanation: "We use 'isteach' here because you are entering an enclosed space (the kitchen)."
                                }
                            ],
                            translation: 'I go into the kitchen.'
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'home_intermediate_1',
                    title: 'Cat Jumping Down',
                    image: '/assets/images/directions/cat_jumping.jpg',
                    description: 'A cat is jumping down from a shelf toward you.',
                    exercises: [
                        {
                            sentence: 'Léimeann an cat ____ ón seilf.',
                            blanks: [
                                {
                                    id: 'home_intermediate_1_blank_1',
                                    options: ['anuas', 'aníos', 'síos', 'suas', 'amach', 'isteach'],
                                    correct: 'anuas',
                                    explanation: "We use 'anuas' here because the cat is jumping down from a higher position toward the speaker."
                                }
                            ],
                            translation: 'The cat jumps down (toward me) from the shelf.'
                        }
                    ]
                },
                {
                    id: 'home_intermediate_2',
                    title: 'Looking Through the Window',
                    image: '/assets/images/directions/looking_window.jpg',
                    description: 'You\'re inside your house looking outward through the window.',
                    exercises: [
                        {
                            sentence: 'Féachaim ____ tríd an bhfuinneog.',
                            blanks: [
                                {
                                    id: 'home_intermediate_2_blank_1',
                                    options: ['amach', 'isteach', 'suas', 'síos', 'anuas', 'aníos'],
                                    correct: 'amach',
                                    explanation: "We use 'amach' here because you are looking out from inside an enclosed space (your house)."
                                }
                            ],
                            translation: 'I look out through the window.'
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'home_advanced_1',
                    title: 'Family Dinner',
                    image: '/assets/images/directions/family_dinner.jpg',
                    description: 'Your family is gathered around the dinner table. Your mother passes a dish to you from across the table.',
                    exercises: [
                        {
                            sentence: 'Cuireann mo mháthair an mias ____ chugam trasna an bhoird.',
                            blanks: [
                                {
                                    id: 'home_advanced_1_blank_1',
                                    options: ['trasna', 'timpeall', 'suas', 'síos', 'amach', 'isteach', 'chugam', 'uaim'],
                                    correct: 'chugam',
                                    explanation: "While 'trasna' (across) describes the path of the dish over the table, 'chugam' (toward me) is the correct directional word here because it emphasizes the movement toward the speaker."
                                }
                            ],
                            translation: 'My mother passes the dish toward me across the table.'
                        }
                    ]
                },
                {
                    id: 'home_advanced_2',
                    title: 'Basement and Attic',
                    image: '/assets/images/directions/house_levels.jpg',
                    description: 'Your house has three levels: a basement, the main floor, and an attic. You\'re on the main floor describing the locations.',
                    exercises: [
                        {
                            sentence: 'Tá an t-áiléar ____ agus tá an íoslach ____.',
                            blanks: [
                                {
                                    id: 'home_advanced_2_blank_1',
                                    options: ['thuas', 'thíos', 'suas', 'síos'],
                                    correct: 'thuas',
                                    explanation: "We use 'thuas' here because the attic is in a static position above the speaker's location on the main floor."
                                },
                                {
                                    id: 'home_advanced_2_blank_2',
                                    options: ['thuas', 'thíos', 'suas', 'síos'],
                                    correct: 'thíos',
                                    explanation: "We use 'thíos' here because the basement is in a static position below the speaker's location on the main floor."
                                }
                            ],
                            translation: 'The attic is up there and the basement is down there.'
                        }
                    ]
                }
            ]
        },
        travel: {
            beginner: [
                {
                    id: 'travel_beginner_1',
                    title: 'Entering a Bus',
                    image: '/assets/images/directions/entering_bus.jpg',
                    description: 'You\'re getting on a bus that has just arrived at your stop.',
                    exercises: [
                        {
                            sentence: 'Téim ____ ar an mbus.',
                            blanks: [
                                {
                                    id: 'travel_beginner_1_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'isteach',
                                    explanation: "We use 'isteach' here because you are entering an enclosed space (the bus)."
                                }
                            ],
                            translation: 'I go into the bus.'
                        }
                    ]
                },
                {
                    id: 'travel_beginner_2',
                    title: 'Climbing a Hill',
                    image: '/assets/images/directions/climbing_hill.jpg',
                    description: 'You\'re hiking up a steep hill on a sunny day.',
                    exercises: [
                        {
                            sentence: 'Táim ag dul ____ an cnoc.',
                            blanks: [
                                {
                                    id: 'travel_beginner_2_blank_1',
                                    options: ['suas', 'síos', 'amach', 'isteach'],
                                    correct: 'suas',
                                    explanation: "We use 'suas' here because you are moving upward on the hill."
                                }
                            ],
                            translation: 'I am going up the hill.'
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'travel_intermediate_1',
                    title: 'Going to America',
                    image: '/assets/images/directions/travel_america.jpg',
                    description: 'You\'re telling your friend about your upcoming trip to America.',
                    exercises: [
                        {
                            sentence: 'Táim ag dul ____ go Meiriceá ar cuairt.',
                            blanks: [
                                {
                                    id: 'travel_intermediate_1_blank_1',
                                    options: ['suas', 'síos', 'siar', 'soir', 'ó thuaidh', 'ó dheas'],
                                    correct: 'siar',
                                    explanation: "We use 'siar' here because traveling from Ireland to America involves going westward (assuming you're in Ireland)."
                                }
                            ],
                            translation: 'I\'m going west to America for a visit.'
                        }
                    ]
                },
                {
                    id: 'travel_intermediate_2',
                    title: 'Mountain Views',
                    image: '/assets/images/directions/mountain_views.jpg',
                    description: 'You\'re standing at the foot of a mountain, looking up at the peak.',
                    exercises: [
                        {
                            sentence: 'Tá barr an tsléibhe ____ uaim.',
                            blanks: [
                                {
                                    id: 'travel_intermediate_2_blank_1',
                                    options: ['thuas', 'thíos', 'suas', 'síos', 'anuas', 'aníos'],
                                    correct: 'thuas',
                                    explanation: "We use 'thuas' here because the mountain peak is in a static position above the speaker."
                                }
                            ],
                            translation: 'The top of the mountain is up there from me.'
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'travel_advanced_1',
                    title: 'City Navigation',
                    image: '/assets/images/directions/city_directions.jpg',
                    description: 'You\'re giving directions to a tourist who is lost in your city.',
                    exercises: [
                        {
                            sentence: 'Téigh ____ an tsráid seo agus cas ____ ag an gcrosbhóthar.',
                            blanks: [
                                {
                                    id: 'travel_advanced_1_blank_1',
                                    options: ['suas', 'síos', 'siar', 'soir', 'trasna'],
                                    correct: 'trasna',
                                    explanation: "We use 'trasna' here because you're instructing them to go across the street from one side to the other."
                                },
                                {
                                    id: 'travel_advanced_1_blank_2',
                                    options: ['ó thuaidh', 'ó dheas', 'siar', 'soir', 'timpeall'],
                                    correct: 'ó thuaidh',
                                    explanation: "We use 'ó thuaidh' here assuming you're telling them to turn northward at the crossroads. This would change based on the actual direction needed."
                                }
                            ],
                            translation: 'Go across this street and turn northward at the crossroads.'
                        }
                    ]
                },
                {
                    id: 'travel_advanced_2',
                    title: 'Ocean Journey',
                    image: '/assets/images/directions/ocean_journey.jpg',
                    description: 'You\'re on a boat sailing around an island, describing your journey to a friend.',
                    exercises: [
                        {
                            sentence: 'Táimid ag seoladh ____ an oileán agus ansin téimid ____ go dtí an cuan.',
                            blanks: [
                                {
                                    id: 'travel_advanced_2_blank_1',
                                    options: ['trasna', 'timpeall', 'suas', 'síos', 'amach', 'isteach'],
                                    correct: 'timpeall',
                                    explanation: "We use 'timpeall' here because you're sailing around the island, encircling it."
                                },
                                {
                                    id: 'travel_advanced_2_blank_2',
                                    options: ['suas', 'síos', 'amach', 'isteach', 'siar', 'soir'],
                                    correct: 'isteach',
                                    explanation: "We use 'isteach' here because you're moving into the harbor, which is an enclosed area compared to the open sea."
                                }
                            ],
                            translation: 'We are sailing around the island and then we go into the harbor.'
                        }
                    ]
                }
            ]
        }
    };

    // Get direction word data
    function getDirectionWord(word) {
        return directionWords[word] || null;
    }

    // Get available words for a specific level
    function getWordsForLevel(level) {
        return levelWords[level] || [];
    }

    // Get scenario data
    function getScenario(category, level, scenarioId) {
        if (scenarios[category] && scenarios[category][level]) {
            if (scenarioId) {
                return scenarios[category][level].find(s => s.id === scenarioId) || null;
            }
            return scenarios[category][level];
        }
        return null;
    }

    // Get all categories
    function getCategories() {
        return Object.keys(scenarios);
    }

    // Get all levels
    function getLevels() {
        return Object.keys(levelWords);
    }

    return {
        getDirectionWord,
        getWordsForLevel,
        getScenario,
        getCategories,
        getLevels
    };
})();
