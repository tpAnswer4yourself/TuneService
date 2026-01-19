import aiofiles
import os
from fastapi import UploadFile

async def save_upload_files(upload_file: UploadFile, destination: str):
    print("Загружаю файл:", {destination})
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    #добавить проверку размера файла, можно в параметры функции добавить INT-размер максимальный
    async with aiofiles.open(destination, 'wb') as out_file:
        content = await upload_file.read()
        await out_file.write(content)
        
    return destination

async def delete_upload_files(destination: str):
    print("Удаляю файл:", {destination})
    #Заглушка для DELETE роута: tracks/delete/{tracks.id}
    return destination