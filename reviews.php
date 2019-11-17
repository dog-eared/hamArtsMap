<?php

if (!isset($_POST["reviewAction"])) {
    die();
}


$action = filter_var($_POST["reviewAction"], FILTER_SANITIZE_STRING);
$mysqli = mysqli_connect("localhost", "000745477", "19910120", "000745477");

if ($action == "view") {
    try {
        $returnJson = array();
        
        $id = filter_var($_POST["reviewId"], FILTER_SANITIZE_NUMBER_INT);
        
        if ($result = $mysqli->query("SELECT * FROM HamArtMap_Reviews WHERE LOCALE_ID = $id")) {
            if (mysqli_num_rows($result) > 0) {            
                while ($row = mysqli_fetch_assoc($result)) {
                    $jsonData = [
                        'id' => $row['LOCALE_ID'],
                        'author' => $row['AUTHOR'],
                        'email' => $row['AUTHOR_EMAIL'],
                        'rating' => $row['RATING'],
                        'content' => $row['CONTENT'],
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
    
            echo json_encode($jsonData, JSON_UNESCAPED_UNICODE);
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
    $email = filter_var($_POST["authorEmail"], FILTER_SANITIZE_STRING);
    $locale = filter_var($_POST["localeId"], FILTER_SANITIZE_NUMBER_INT);
    $rating = filter_var($_POST["rating"], FILTER_SANITIZE_NUMBER_INT);
    $content = filter_var($_POST["content"], FILTER_SANITIZE_STRING);

    try {
        $query = "INSERT INTO HamArtMap_Reviews (AUTHOR, AUTHOR_EMAIL, RATING, CONTENT, LOCALE_ID) VALUES ('$author', '$email', $rating, '$content', $locale)";
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
            "error" => -1
        ];

        echo json_encode($jsonData, JSON_UNESCAPED_UNICODE);
        die();
    }
} else {
    $jsonData = [
        "error" => -3
    ];

    echo json_encode($jsonData, JSON_UNESCAPED_UNICODE);
    die();
}
?> 