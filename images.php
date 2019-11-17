<?php

$action = filter_var($_POST["imageAction"], FILTER_SANITIZE_STRING);
$mysqli = mysqli_connect("localhost", "000745477", "19910120", "000745477");
$returnJson;

if ($action == "view") {
    try {
        $returnJson = array();
        $id = filter_var($_POST["imageId"], FILTER_SANITIZE_NUMBER_INT);
        
        if ($result = $mysqli->query("SELECT * FROM HamArtMap_UserImages WHERE LOCALE_ID = $id")) {
            if (mysqli_num_rows($result) > 0) {            
                while ($row = mysqli_fetch_assoc($result)) {
                    $jsonData = [
                        'id' => $row['LOCALE_ID'],
                        'author' => $row['AUTHOR'],
                        'imageUrl' => $row['IMAGE_URL'],
                        'date' => $row['POST_DATE']
                    ];

                    $returnJson[] = $jsonData;
                }

                echo json_encode($returnJson);
            } else {
                $jsonData = [
                    "error" => -1
                ];
        
                echo json_encode($jsonData);
                die();
            }
            
            $result->close();
        } else {
            $jsonData = [
                "error" => -1
            ];
    
            echo json_encode($jsonData);
            die();
        }   
        
    } catch (Exception $e) {
        $jsonData = [
            "error" => -2
        ];

        echo json_encode($jsonData);
        die();
    }
} else if ($action == "add") {
    $author = filter_var($_POST["authorName"], FILTER_SANITIZE_STRING);
    $locale = filter_var($_POST["localeId"], FILTER_SANITIZE_NUMBER_INT);
    $url = filter_var($_POST["url"], FILTER_SANITIZE_STRING);

    if (strlen($author) < 1 || strlen($url) < 1) {
        $jsonData = [
            "error" => -1
        ];

        echo json_encode($jsonData);
        die();
    } 

    try {
        $query = "INSERT INTO HamArtMap_UserImages (AUTHOR, LOCALE_ID, IMAGE_URL) VALUES ('$author', $locale, '$url')";
        $jsonData;
        
        if (mysqli_query($mysqli, $query)) {
            $jsonData = [
                "success" => -1
            ];
        } else {
            $jsonData = [
                "error" => -1
            ];
        }

        echo json_encode($jsonData, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        $jsonData = [
            "error" => -2
        ];

        echo json_encode($jsonData);
        die();
    }
} else {
    $jsonData = [
        "error" => -3
    ];

    echo json_encode($jsonData);
    die();
}
?>