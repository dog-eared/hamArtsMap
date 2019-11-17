<?php

try {
    $mysqli = mysqli_connect("localhost", "000745477", "19910120", "000745477");
    $mysqli->set_charset("utf8");

    $returnJson = array();

    $constraintEnding = "";
    $hasFilters = false;
    $filters = "";

    if (isset($_POST["searchTerm"]) && strlen($_POST["searchTerm"]) > 0) {
        $searchTerm = filter_var($_POST["searchTerm"], FILTER_SANITIZE_STRING);
        $constraintEnding = " WHERE TITLE LIKE '%" . $searchTerm . "%'";
    }

    if (isset($_POST["filterMuseums"])) {
        $filters .= " CATEGORY LIKE '%Museum%' ";
        $hasFilters = true;
    }
    
    if (isset($_POST["filterMonuments"])) {
        if ($hasFilters) {
            $filters .= " OR ";
        }
        $filters .= " CATEGORY LIKE '%Monument%' ";
        $hasFilters = true;
    }
    
    if (isset($_POST["filterArt"])) {
        if ($hasFilters) {
            $filters .= " OR ";
        }
        $filters .= " CATEGORY LIKE '%Public Art%' ";
    }

    if (isset($_POST["filterUnreviewed"])) {
        $constraintEnding = " WHERE RATING = 0";
        $filters = "";
    }

    if (isset($_POST["filterHighestRated"])) {
        $constraintEnding = " WHERE RATING > 0 ORDER BY RATING DESC";
        $filters = "";
    }

    if (isset($_POST["filterNearby"])) {
        $long = $_POST["currentLong"];
        $lat = $_POST["currentLat"];
        $distance = 5;

        $constraintEnding = " WHERE LONGITUDE > " . $currentLong - $distance 
        . " && LONGITUDE < " . $currentLong + $distance . " && WHERE LATITUDE > " . $currentLat - $distance 
        . " && LATITUDE < " . $currentLat + $distance . "ORDER BY RATING DESC";
        $filters = "";
    }

    if (isset($_POST["specificId"])) {
        $specificId = filter_var($_POST["specificId"], FILTER_SANITIZE_NUMBER_INT);
        $constraintEnding = " WHERE ID = " . $specificId;
        $filters = "";
    }

    if (strlen($filters) > 0) {
        if (strlen($constraintEnding) > 0) {
            $constraintEnding .= " AND (" . $filters . ")";
        } else {
            $constraintEnding .= " WHERE (" . $filters . ")";
        }
    }

    if ($result = $mysqli->query("SELECT * FROM HamArtMap_Locales " . utf8_encode($constraintEnding))) {
        if (mysqli_num_rows($result) > 0) {            
            while ($row = mysqli_fetch_assoc($result)) {
                $jsonData = [
                    'id' => $row['ID'],
                    'name' => $row['TITLE'],
                    'blurb' => $row['DESCRIPTION'],
                    'type' => $row['CATEGORY'],
                    'rating' => $row['RATING'],
                    'postal' => $row['POSTAL_CODE'],
                    'long' => $row['LONGITUDE'],
                    'lat' => $row['LATITUDE']
                ];

                $returnJson[] = $jsonData;
            }

            echo json_encode($returnJson, JSON_UNESCAPED_UNICODE);

        } else {
            $jsonData = [
                "error" => -1
            ];
    
            echo json_encode($jsonData);
            die();
        }

        $result->close();
    }

} catch (Exception $e) {
    $jsonData = [
        "error" => -2
    ];

    echo json_encode($jsonData);
    die();
}

?> 